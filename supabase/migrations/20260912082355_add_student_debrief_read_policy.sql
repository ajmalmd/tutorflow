-- =========================================================
-- Students can read AI debriefs for their own sessions
-- =========================================================
alter table public.session_debriefs enable row level security;

create policy "Students can read their own session debriefs" on public.session_debriefs for
select
    to authenticated using (
        exists (
            select
                1
            from
                public.sessions s
                inner join public.students st on st.id = s.student_id
            where
                s.id = session_debriefs.session_id
                and st.user_id = auth.uid ()
        )
    );