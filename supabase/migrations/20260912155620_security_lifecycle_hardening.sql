-- =========================================================
-- Security + lifecycle hardening
-- =========================================================

-- =========================================================
-- 1. Harden tutor session creation
--
-- Prevent direct INSERT abuse such as:
-- - creating a session directly as completed/ai_reviewed
-- - inserting live notes during scheduling
-- - inserting lifecycle timestamps manually
-- =========================================================

drop policy if exists "tutors_create_own_sessions"
on public.sessions;

create policy "tutors_create_own_sessions"
on public.sessions
for insert
to authenticated
with check (
    tutor_id = auth.uid()

    and status = 'scheduled'::public.session_status

    and live_notes = ''

    and completed_at is null

    and reviewed_at is null

    and exists (
        select 1
        from public.students st
        where st.id = sessions.student_id
          and st.tutor_id = auth.uid()
    )

    and exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'tutor'::public.user_role
    )
);


-- =========================================================
-- 2. Remove student direct SELECT access to sessions
--
-- RLS protects rows, not columns.
--
-- Direct access would allow students to query live_notes,
-- even if the frontend does not select it.
--
-- Students will use a restricted RPC instead.
-- =========================================================

drop policy if exists "students_read_own_sessions"
on public.sessions;


-- =========================================================
-- 3. Remove student direct SELECT access to debrief table
--
-- Prevent direct access to internal columns such as model.
--
-- There are currently two equivalent student policies, so
-- remove both.
-- =========================================================

drop policy if exists "students_read_session_debriefs"
on public.session_debriefs;

drop policy if exists "Students can read their own session debriefs"
on public.session_debriefs;


-- =========================================================
-- 4. Safe student sessions RPC
--
-- Exposes only student-safe session fields.
-- live_notes is intentionally not returned.
-- =========================================================

create or replace function public.get_my_sessions()
returns table (
    id uuid,
    topic text,
    starts_at timestamptz,
    ends_at timestamptz,
    status public.session_status,
    completed_at timestamptz,
    reviewed_at timestamptz,
    created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        s.id,
        s.topic,
        s.starts_at,
        s.ends_at,
        s.status,
        s.completed_at,
        s.reviewed_at,
        s.created_at
    from public.sessions s
    inner join public.students st
        on st.id = s.student_id
    inner join public.profiles p
        on p.id = st.user_id
    where st.user_id = auth.uid()
      and p.role = 'student'::public.user_role
    order by s.starts_at desc;
$$;

revoke all
on function public.get_my_sessions()
from public;

grant execute
on function public.get_my_sessions()
to authenticated;


-- =========================================================
-- 5. Safe student debrief RPC
--
-- Exposes:
-- - summary
-- - homework
-- - next_focus
--
-- Does NOT expose model/provider metadata.
--
-- Also requires the parent session to be ai_reviewed.
-- =========================================================

create or replace function public.get_my_session_debriefs()
returns table (
    id uuid,
    session_id uuid,
    summary text,
    homework jsonb,
    next_focus text,
    created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        sd.id,
        sd.session_id,
        sd.summary,
        sd.homework,
        sd.next_focus,
        sd.created_at
    from public.session_debriefs sd
    inner join public.sessions s
        on s.id = sd.session_id
    inner join public.students st
        on st.id = s.student_id
    inner join public.profiles p
        on p.id = st.user_id
    where st.user_id = auth.uid()
      and p.role = 'student'::public.user_role
      and s.status = 'ai_reviewed'::public.session_status
    order by sd.created_at desc;
$$;

revoke all
on function public.get_my_session_debriefs()
from public;

grant execute
on function public.get_my_session_debriefs()
to authenticated;


-- =========================================================
-- 6. Harden global session lifecycle
--
-- Allowed lifecycle:
--
-- scheduled
--     -> in_progress
--     -> completed
--     -> ai_reviewed
--
-- Rules:
-- - completed sessions are immutable except for transition
--   to ai_reviewed
-- - ai_reviewed sessions are fully immutable
-- - normal same-status mutations remain allowed only while
--   scheduled/in_progress
-- =========================================================

create or replace function public.enforce_session_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin

    -- -----------------------------------------------------
    -- AI-reviewed session is permanently immutable.
    -- -----------------------------------------------------

    if old.status = 'ai_reviewed'::public.session_status then
        raise exception
            'AI-reviewed sessions are immutable.'
            using errcode = '23514';
    end if;


    -- -----------------------------------------------------
    -- Completed session:
    -- only completed -> ai_reviewed is permitted.
    -- -----------------------------------------------------

    if old.status = 'completed'::public.session_status then

        if new.status = 'ai_reviewed'::public.session_status then
            new.reviewed_at = now();

            return new;
        end if;

        raise exception
            'Completed sessions are immutable.'
            using errcode = '23514';
    end if;


    -- -----------------------------------------------------
    -- Same-state mutation is allowed before completion.
    --
    -- Examples:
    -- scheduled -> scheduled
    -- in_progress -> in_progress
    --
    -- This permits controlled mutations such as live notes.
    -- RLS/RPC permissions still decide who can make them.
    -- -----------------------------------------------------

    if new.status = old.status then
        return new;
    end if;


    -- -----------------------------------------------------
    -- scheduled -> in_progress
    -- -----------------------------------------------------

    if old.status = 'scheduled'::public.session_status
       and new.status = 'in_progress'::public.session_status then

        return new;
    end if;


    -- -----------------------------------------------------
    -- in_progress -> completed
    -- -----------------------------------------------------

    if old.status = 'in_progress'::public.session_status
       and new.status = 'completed'::public.session_status then

        new.completed_at = now();

        return new;
    end if;


    -- -----------------------------------------------------
    -- Everything else is invalid.
    -- -----------------------------------------------------

    raise exception
        'Invalid session status transition: % -> %',
        old.status,
        new.status
        using errcode = '23514';
end;
$$;


-- =========================================================
-- 7. Harden save_session_plan()
--
-- Changes:
-- - empty search_path
-- - explicit auth check
-- - ownership + tutor role
-- - row lock
-- - scheduled status required
-- - session must still be in the future
-- - existing plan prevented
-- =========================================================

create or replace function public.save_session_plan(
    p_session_id uuid,
    p_objectives jsonb,
    p_lesson_outline jsonb,
    p_practice_questions jsonb,
    p_model text
)
returns public.session_plans
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_session public.sessions;
    v_plan public.session_plans;
begin

    -- -----------------------------------------------------
    -- Authentication
    -- -----------------------------------------------------

    if auth.uid() is null then
        raise exception
            'Authentication required.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Lock session and verify:
    -- - session exists
    -- - caller owns it
    -- - caller is still a tutor
    -- -----------------------------------------------------

    select s.*
    into v_session
    from public.sessions s
    inner join public.profiles p
        on p.id = s.tutor_id
    where s.id = p_session_id
      and s.tutor_id = auth.uid()
      and p.role = 'tutor'::public.user_role
    for update of s;

    if not found then
        raise exception
            'Session not found or access denied.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Plan can only be saved while scheduled.
    -- -----------------------------------------------------

    if v_session.status <> 'scheduled'::public.session_status then
        raise exception
            'A session plan can only be saved for a scheduled session.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- A lesson plan is a pre-session artifact.
    --
    -- Even if the status was never changed from scheduled,
    -- do not allow saving after the scheduled start time.
    -- -----------------------------------------------------

    if v_session.starts_at <= now() then
        raise exception
            'A session plan can only be saved before the session starts.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Prevent regeneration / overwrite.
    --
    -- UNIQUE(session_id) remains the final race-safety
    -- guarantee.
    -- -----------------------------------------------------

    if exists (
        select 1
        from public.session_plans sp
        where sp.session_id = p_session_id
    ) then
        raise exception
            'A session plan already exists.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Basic artifact validation.
    --
    -- Strong structural validation still happens in the
    -- application using Zod.
    -- -----------------------------------------------------

    if p_objectives is null
       or p_lesson_outline is null
       or p_practice_questions is null then

        raise exception
            'Session plan content is required.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Save plan
    -- -----------------------------------------------------

    insert into public.session_plans (
        session_id,
        objectives,
        lesson_outline,
        practice_questions,
        model
    )
    values (
        p_session_id,
        p_objectives,
        p_lesson_outline,
        p_practice_questions,
        p_model
    )
    returning *
    into v_plan;

    return v_plan;
end;
$$;

revoke all
on function public.save_session_plan(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    text
)
from public;

grant execute
on function public.save_session_plan(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    text
)
to authenticated;


-- =========================================================
-- 8. Harden save_session_debrief_and_review()
--
-- Changes:
-- - empty search_path
-- - ownership + tutor role
-- - row lock
-- - completed-only
-- - duplicate protection
-- - useful live notes required
-- - basic output validation
-- - lifecycle trigger owns reviewed_at
-- - updated_at trigger owns updated_at
-- =========================================================

create or replace function public.save_session_debrief_and_review(
    p_session_id uuid,
    p_summary text,
    p_homework jsonb,
    p_next_focus text,
    p_model text
)
returns public.session_debriefs
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_session public.sessions;
    v_debrief public.session_debriefs;
begin

    -- -----------------------------------------------------
    -- Authentication
    -- -----------------------------------------------------

    if auth.uid() is null then
        raise exception
            'Authentication required.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Lock parent session and verify tutor ownership.
    --
    -- This serializes concurrent review attempts against the
    -- same session.
    -- -----------------------------------------------------

    select s.*
    into v_session
    from public.sessions s
    inner join public.profiles p
        on p.id = s.tutor_id
    where s.id = p_session_id
      and s.tutor_id = auth.uid()
      and p.role = 'tutor'::public.user_role
    for update of s;

    if not found then
        raise exception
            'Session not found or access denied.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Lifecycle validation
    -- -----------------------------------------------------

    if v_session.status <> 'completed'::public.session_status then
        raise exception
            'Only completed sessions can be AI reviewed.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Require useful tutor notes.
    --
    -- trim removes whitespace-only values.
    --
    -- 10 characters is intentionally conservative:
    -- enough to reject empty/useless requests without
    -- introducing heavy business logic at DB level.
    -- -----------------------------------------------------

    if length(trim(v_session.live_notes)) < 10 then
        raise exception
            'Add useful live notes before generating the session review.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Prevent duplicate debriefs.
    --
    -- UNIQUE(session_id) remains the race-safe final guard.
    -- -----------------------------------------------------

    if exists (
        select 1
        from public.session_debriefs sd
        where sd.session_id = p_session_id
    ) then
        raise exception
            'A session debrief already exists.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Basic artifact integrity checks.
    --
    -- Detailed AI output structure continues to be validated
    -- in the application with Zod before this RPC is called.
    -- -----------------------------------------------------

    if p_summary is null
       or length(trim(p_summary)) = 0 then

        raise exception
            'Debrief summary is required.'
            using errcode = 'P0001';
    end if;


    if p_next_focus is null
       or length(trim(p_next_focus)) = 0 then

        raise exception
            'Debrief next focus is required.'
            using errcode = 'P0001';
    end if;


    if p_homework is null then
        raise exception
            'Debrief homework is required.'
            using errcode = 'P0001';
    end if;


    -- -----------------------------------------------------
    -- Save debrief
    -- -----------------------------------------------------

    insert into public.session_debriefs (
        session_id,
        summary,
        homework,
        next_focus,
        model
    )
    values (
        p_session_id,
        trim(p_summary),
        p_homework,
        trim(p_next_focus),
        p_model
    )
    returning *
    into v_debrief;


    -- -----------------------------------------------------
    -- Transition:
    --
    -- completed -> ai_reviewed
    --
    -- reviewed_at is populated by:
    -- enforce_session_status_transition()
    --
    -- updated_at is populated by:
    -- sessions_set_updated_at
    --
    -- If this update fails, PostgreSQL rolls back the
    -- debrief insert above as part of the same transaction.
    -- -----------------------------------------------------

    update public.sessions
    set status = 'ai_reviewed'::public.session_status
    where id = p_session_id;


    return v_debrief;
end;
$$;

revoke all
on function public.save_session_debrief_and_review(
    uuid,
    text,
    jsonb,
    text,
    text
)
from public;

grant execute
on function public.save_session_debrief_and_review(
    uuid,
    text,
    jsonb,
    text,
    text
)
to authenticated;


-- =========================================================
-- 9. Re-harden existing lifecycle RPC permissions
--
-- These were already configured in previous migrations.
-- Repeating them here makes the security expectations for
-- the final schema explicit.
-- =========================================================

revoke execute
on function public.start_session(uuid)
from public, anon;

grant execute
on function public.start_session(uuid)
to authenticated;


revoke execute
on function public.complete_session(uuid)
from public, anon;

grant execute
on function public.complete_session(uuid)
to authenticated;


revoke execute
on function public.save_session_live_notes(uuid, text)
from public, anon;

grant execute
on function public.save_session_live_notes(uuid, text)
to authenticated;