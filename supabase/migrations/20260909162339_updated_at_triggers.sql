create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create trigger sessions_set_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();