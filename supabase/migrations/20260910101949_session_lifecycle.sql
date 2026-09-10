-- =========================================================
-- Session lifecycle
-- =========================================================

-- ---------------------------------------------------------
-- Enforce valid session status transitions globally.
--
-- Allowed:
-- scheduled    -> in_progress
-- in_progress  -> completed
-- completed    -> ai_reviewed
--
-- Staying in the same state is allowed because unrelated
-- fields such as live_notes may be updated later.
-- ---------------------------------------------------------

create or replace function public.enforce_session_status_transition()
returns trigger
language plpgsql
as $$
begin
    -- Status has not changed.
    if new.status = old.status then
        return new;
    end if;

    if old.status = 'scheduled'
       and new.status = 'in_progress' then

        return new;

    elsif old.status = 'in_progress'
          and new.status = 'completed' then

        new.completed_at = now();

        return new;

    elsif old.status = 'completed'
          and new.status = 'ai_reviewed' then

        new.reviewed_at = now();

        return new;
    end if;

    raise exception
        'Invalid session status transition: % -> %',
        old.status,
        new.status
        using errcode = '23514';
end;
$$;


create trigger sessions_enforce_status_transition
before update of status
on public.sessions
for each row
execute function public.enforce_session_status_transition();


-- =========================================================
-- Start session
--
-- Atomic conditional update:
--
-- scheduled -> in_progress
--
-- The tutor must:
-- - be authenticated
-- - own the session
-- - currently have tutor role
-- - be transitioning from scheduled
-- =========================================================

create or replace function public.start_session(
    p_session_id uuid
)
returns public.sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_session public.sessions;
begin
    update public.sessions
    set status = 'in_progress'::public.session_status
    where id = p_session_id
      and tutor_id = auth.uid()
      and status = 'scheduled'::public.session_status
      and exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'tutor'::public.user_role
      )
    returning *
    into v_session;

    if v_session.id is null then
        raise exception
            'Session cannot be started.'
            using errcode = 'P0001';
    end if;

    return v_session;
end;
$$;


-- =========================================================
-- Complete session
--
-- Atomic conditional update:
--
-- in_progress -> completed
--
-- completed_at is populated by the lifecycle trigger.
-- =========================================================

create or replace function public.complete_session(
    p_session_id uuid
)
returns public.sessions
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_session public.sessions;
begin
    update public.sessions
    set status = 'completed'::public.session_status
    where id = p_session_id
      and tutor_id = auth.uid()
      and status = 'in_progress'::public.session_status
      and exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'tutor'::public.user_role
      )
    returning *
    into v_session;

    if v_session.id is null then
        raise exception
            'Session cannot be completed.'
            using errcode = 'P0001';
    end if;

    return v_session;
end;
$$;


-- ---------------------------------------------------------
-- Lock RPC execution down.
-- ---------------------------------------------------------

revoke execute
on function public.start_session(uuid)
from public, anon;

revoke execute
on function public.complete_session(uuid)
from public, anon;

grant execute
on function public.start_session(uuid)
to authenticated;

grant execute
on function public.complete_session(uuid)
to authenticated;