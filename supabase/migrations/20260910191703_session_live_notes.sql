-- =========================================================
-- Live notes
-- =========================================================

create or replace function public.save_session_live_notes(
    p_session_id uuid,
    p_live_notes text
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
    set live_notes = p_live_notes
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
            'Live notes cannot be updated for this session.'
            using errcode = 'P0001';
    end if;

    return v_session;
end;
$$;


revoke execute
on function public.save_session_live_notes(uuid, text)
from public, anon;

grant execute
on function public.save_session_live_notes(uuid, text)
to authenticated;