-- =========================================================
-- Save AI session plan
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
set search_path = public, pg_temp
as $$
declare
    v_session public.sessions;
    v_plan public.session_plans;
begin
    -- -----------------------------------------------------
    -- Authentication
    -- -----------------------------------------------------

    if auth.uid() is null then
        raise exception 'Authentication required.';
    end if;

    -- -----------------------------------------------------
    -- Lock session and verify tutor ownership.
    -- -----------------------------------------------------

    select s.*
    into v_session
    from public.sessions s
    inner join public.profiles p
        on p.id = s.tutor_id
    where
        s.id = p_session_id
        and s.tutor_id = auth.uid()
        and p.role = 'tutor'
    for update of s;

    if not found then
        raise exception
            'Session not found or access denied.';
    end if;

    -- -----------------------------------------------------
    -- Plan generation only before session starts.
    -- -----------------------------------------------------

    if v_session.status <> 'scheduled' then
        raise exception
            'A session plan can only be saved for a scheduled session.';
    end if;

    -- -----------------------------------------------------
    -- Prevent regeneration / overwrite.
    -- Unique(session_id) also protects against races.
    -- -----------------------------------------------------

    if exists (
        select 1
        from public.session_plans sp
        where sp.session_id = p_session_id
    ) then
        raise exception
            'A session plan already exists.';
    end if;

    -- -----------------------------------------------------
    -- Save generated plan.
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