-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.profiles enable row level security;

alter table public.students enable row level security;

alter table public.sessions enable row level security;

alter table public.session_plans enable row level security;

alter table public.session_debriefs enable row level security;

-- =========================================================
-- PROFILES
-- =========================================================
create policy "users_read_own_profile" on public.profiles for
select
    to authenticated using (
        id = (
            select
                auth.uid ()
        )
    );

-- =========================================================
-- STUDENTS
-- =========================================================
create policy "tutors_read_own_students" on public.students for
select
    to authenticated using (
        tutor_id = (
            select
                auth.uid ()
        )
    );

create policy "students_read_own_profile" on public.students for
select
    to authenticated using (
        user_id = (
            select
                auth.uid ()
        )
    );

-- =========================================================
-- SESSIONS
-- =========================================================
create policy "tutors_read_own_sessions" on public.sessions for
select
    to authenticated using (
        tutor_id = (
            select
                auth.uid ()
        )
    );

create policy "students_read_own_sessions" on public.sessions for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.students
            where
                students.id = sessions.student_id
                and students.user_id = (
                    select
                        auth.uid ()
                )
        )
    );

-- =========================================================
-- SESSION PLANS
-- Tutor-only
-- =========================================================
create policy "tutors_read_session_plans" on public.session_plans for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.sessions
            where
                sessions.id = session_plans.session_id
                and sessions.tutor_id = (
                    select
                        auth.uid ()
                )
        )
    );

-- =========================================================
-- SESSION DEBRIEFS
-- =========================================================
create policy "tutors_read_session_debriefs" on public.session_debriefs for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.sessions
            where
                sessions.id = session_debriefs.session_id
                and sessions.tutor_id = (
                    select
                        auth.uid ()
                )
        )
    );

create policy "students_read_session_debriefs" on public.session_debriefs for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.sessions
                join public.students on students.id = sessions.student_id
            where
                sessions.id = session_debriefs.session_id
                and students.user_id = (
                    select
                        auth.uid ()
                )
        )
    );