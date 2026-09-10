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
      and starts_at <= now()
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