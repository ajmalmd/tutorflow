-- =========================================================
-- Save AI session debrief and transition session to ai_reviewed atomically.
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
set search_path = public, pg_temp
as $$
declare
    v_session public.sessions;
    v_debrief public.session_debriefs;
begin
    -- -----------------------------------------------------
    -- Authentication
    -- -----------------------------------------------------

    if auth.uid() is null then
        raise exception 'Authentication required.';
    end if;

    -- -----------------------------------------------------
    -- Lock session and verify tutor ownership.
    --
    -- The row lock also prevents two concurrent review
    -- mutations from transitioning the same session.
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
    -- Lifecycle validation
    -- -----------------------------------------------------

    if v_session.status <> 'completed' then
        raise exception
            'Only completed sessions can be AI reviewed.';
    end if;

    -- -----------------------------------------------------
    -- Debrief must only exist once.
    -- session_debriefs.session_id is also UNIQUE.
    -- -----------------------------------------------------

    if exists (
        select 1
        from public.session_debriefs sd
        where sd.session_id = p_session_id
    ) then
        raise exception
            'A session debrief already exists.';
    end if;

    -- -----------------------------------------------------
    -- Insert debrief
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
        p_summary,
        p_homework,
        p_next_focus,
        p_model
    )
    returning *
    into v_debrief;

    -- -----------------------------------------------------
    -- Complete lifecycle transition.
    --
    -- If your existing lifecycle trigger rejects this
    -- transition, the entire function fails and the
    -- debrief INSERT above is rolled back too.
    -- -----------------------------------------------------

    update public.sessions
    set
        status = 'ai_reviewed',
        reviewed_at = now(),
        updated_at = now()
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