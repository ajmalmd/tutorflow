create or replace function public.find_auth_user_by_email(
    p_email text
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
    select u.id
    from auth.users u
    where lower(u.email) = lower(trim(p_email))
    limit 1;
$$;

revoke all
on function public.find_auth_user_by_email(text)
from public;

revoke all
on function public.find_auth_user_by_email(text)
from anon;

revoke all
on function public.find_auth_user_by_email(text)
from authenticated;

grant execute
on function public.find_auth_user_by_email(text)
to service_role;