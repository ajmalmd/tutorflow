-- =========================================================
-- Session scheduling
-- =========================================================

-- Required so uuid can participate in a GiST exclusion
-- constraint with the "=" operator.
create extension if not exists btree_gist;

-- ---------------------------------------------------------
-- Sessions: tutor scheduling policy
-- ---------------------------------------------------------

create policy "tutors_create_own_sessions"
on public.sessions
for insert
to authenticated
with check (
    tutor_id = (
        select auth.uid()
    )
    and exists (
        select 1
        from public.students
        where students.id = sessions.student_id
          and students.tutor_id = (
              select auth.uid()
          )
    )
    and exists (
        select 1
        from public.profiles
        where profiles.id = (
            select auth.uid()
        )
          and profiles.role = 'tutor'
    )
);

-- ---------------------------------------------------------
-- Prevent tutor double-booking
--
-- [) means:
-- start is inclusive
-- end is exclusive
--
-- Therefore:
-- 10:00 - 11:00
-- 11:00 - 12:00
--
-- are allowed.
-- ---------------------------------------------------------

alter table public.sessions
add constraint sessions_tutor_no_overlap
exclude using gist (
    tutor_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
);