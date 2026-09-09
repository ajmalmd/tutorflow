-- =========================================================
-- TutorFlow: Initial schema
-- =========================================================
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Enums
-- ---------------------------------------------------------
create type public.user_role as enum ('tutor', 'student');

create type public.session_status as enum (
    'scheduled',
    'in_progress',
    'completed',
    'ai_reviewed'
);

-- ---------------------------------------------------------
-- Profiles
-- Maps application users to Supabase Auth identities.
-- ---------------------------------------------------------
create table
    public.profiles (
        id uuid primary key references auth.users (id) on delete cascade,
        role public.user_role not null,
        full_name text not null,
        created_at timestamptz not null default now (),
        updated_at timestamptz not null default now ()
    );

-- ---------------------------------------------------------
-- Students
-- ---------------------------------------------------------
create table
    public.students (
        id uuid primary key default gen_random_uuid (),
        tutor_id uuid not null references public.profiles (id) on delete cascade,
        user_id uuid not null unique references public.profiles (id) on delete cascade,
        name text not null,
        subject text not null,
        current_level text not null,
        learning_goals text not null default '',
        weak_areas text not null default '',
        created_at timestamptz not null default now (),
        updated_at timestamptz not null default now (),
        constraint tutor_and_student_must_differ check (tutor_id <> user_id)
    );

create index idx_students_tutor_id on public.students (tutor_id);

-- ---------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------
create table
    public.sessions (
        id uuid primary key default gen_random_uuid (),
        tutor_id uuid not null references public.profiles (id) on delete cascade,
        student_id uuid not null references public.students (id) on delete cascade,
        topic text not null,
        starts_at timestamptz not null,
        ends_at timestamptz not null,
        status public.session_status not null default 'scheduled',
        live_notes text not null default '',
        completed_at timestamptz,
        reviewed_at timestamptz,
        created_at timestamptz not null default now (),
        updated_at timestamptz not null default now (),
        constraint session_end_after_start check (ends_at > starts_at)
    );

create index idx_sessions_tutor_id on public.sessions (tutor_id);

create index idx_sessions_student_id on public.sessions (student_id);

create index idx_sessions_tutor_time on public.sessions (tutor_id, starts_at, ends_at);

-- ---------------------------------------------------------
-- Session plans
-- AI-generated before a session begins
-- ---------------------------------------------------------
create table
    public.session_plans (
        id uuid primary key default gen_random_uuid (),
        session_id uuid not null unique references public.sessions (id) on delete cascade,
        objectives jsonb not null,
        lesson_outline jsonb not null,
        practice_questions jsonb not null,
        model text,
        created_at timestamptz not null default now ()
    );

-- ---------------------------------------------------------
-- Session debriefs
-- AI-generated after the tutor completes a session
-- ---------------------------------------------------------
create table
    public.session_debriefs (
        id uuid primary key default gen_random_uuid (),
        session_id uuid not null unique references public.sessions (id) on delete cascade,
        summary text not null,
        homework jsonb not null,
        next_focus text not null,
        model text,
        created_at timestamptz not null default now ()
    );