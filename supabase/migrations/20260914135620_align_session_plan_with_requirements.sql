-- =========================================================
-- Save Session Plan

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
    v_session public.sessions%rowtype;
    v_plan public.session_plans%rowtype;
begin
    if auth.uid() is null then
        raise exception 'Authentication required.';
    end if;

    select s.*
    into v_session
    from public.sessions s
    inner join public.profiles p
        on p.id = s.tutor_id
    where s.id = p_session_id
      and s.tutor_id = auth.uid()
      and p.role = 'tutor'::public.user_role
    for update;

    if not found then
        raise exception 'Session not found or access denied.';
    end if;

    -- Feature requirement:
    -- plan can be generated any time before the session
    -- is actually started.
    if v_session.status <> 'scheduled'::public.session_status then
        raise exception 'Session plan can only be generated before the session starts.';
    end if;

    if exists (
        select 1
        from public.session_plans sp
        where sp.session_id = p_session_id
    ) then
        raise exception 'A session plan already exists for this session.';
    end if;

    if p_objectives is null
       or p_lesson_outline is null
       or p_practice_questions is null then
        raise exception 'Session plan content is required.';
    end if;

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

revoke all on function public.save_session_plan(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    text
) from public;

grant execute on function public.save_session_plan(
    uuid,
    jsonb,
    jsonb,
    jsonb,
    text
) to authenticated;

-- =========================================================
-- =========================================================


-- =========================================================
-- Complete Session

create or replace function public.complete_session(
    p_session_id uuid
)
returns public.sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_session public.sessions%rowtype;
begin
    if auth.uid() is null then
        raise exception 'Authentication required.';
    end if;

    select s.*
    into v_session
    from public.sessions s
    inner join public.profiles p
        on p.id = s.tutor_id
    where s.id = p_session_id
      and s.tutor_id = auth.uid()
      and p.role = 'tutor'::public.user_role
    for update;

    if not found then
        raise exception 'Session not found or access denied.';
    end if;

    if v_session.status <> 'in_progress'::public.session_status then
        raise exception 'Only an in-progress session can be completed.';
    end if;

    -- Debrief depends on tutor notes.
    if length(trim(coalesce(v_session.live_notes, ''))) < 10 then
        raise exception 'Add useful session notes before completing the session.';
    end if;

    update public.sessions
    set status = 'completed'::public.session_status
    where id = p_session_id
    returning *
    into v_session;

    return v_session;
end;
$$;

revoke all on function public.complete_session(uuid) from public;
grant execute on function public.complete_session(uuid) to authenticated;

-- =========================================================
-- =========================================================