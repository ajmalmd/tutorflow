-- =========================================================
-- TutorFlow demo seed
--
-- Replace these with the UUIDs from Supabase Auth.
-- =========================================================
insert into
    public.profiles (id, role, full_name)
values
    (
        'e66b99a8-c672-4884-a141-8cc0e8271c91',
        'tutor',
        'Demo Tutor'
    ),
    (
        '6e5db200-2171-4333-bb6d-3ab18f91a70e',
        'student',
        'Maya Shah'
    );

insert into
    public.students (
        tutor_id,
        user_id,
        name,
        subject,
        current_level,
        learning_goals,
        weak_areas
    )
values
    (
        'e66b99a8-c672-4884-a141-8cc0e8271c91',
        '6e5db200-2171-4333-bb6d-3ab18f91a70e',
        'Maya Shah',
        'Mathematics',
        'GCSE Foundation',
        'Improve algebra confidence and work towards Grade 6.',
        'Factorisation, translating word problems into equations, and checking multi-step calculations.'
    );

-- =========================================================
-- Historical / upcoming sessions for Maya
-- =========================================================
insert into
    public.sessions (
        tutor_id,
        student_id,
        topic,
        starts_at,
        ends_at,
        status,
        live_notes,
        completed_at,
        reviewed_at
    )
select
    'e66b99a8-c672-4884-a141-8cc0e8271c91',
    students.id,
    'Linear equations',
    now () - interval '14 days',
    now () - interval '14 days' + interval '60 minutes',
    'ai_reviewed',
    'Maya solved one-step equations confidently. She initially forgot to perform the same operation on both sides when solving two-step equations but improved after worked examples.',
    now () - interval '14 days' + interval '60 minutes',
    now () - interval '14 days' + interval '65 minutes'
from
    public.students
where
    user_id = '6e5db200-2171-4333-bb6d-3ab18f91a70e';

insert into
    public.sessions (
        tutor_id,
        student_id,
        topic,
        starts_at,
        ends_at,
        status,
        live_notes,
        completed_at,
        reviewed_at
    )
select
    'e66b99a8-c672-4884-a141-8cc0e8271c91',
    students.id,
    'Expanding brackets',
    now () - interval '7 days',
    now () - interval '7 days' + interval '45 minutes',
    'ai_reviewed',
    'Maya understood single brackets quickly. Negative coefficients caused some sign errors. By the final questions she was checking signs before simplifying.',
    now () - interval '7 days' + interval '45 minutes',
    now () - interval '7 days' + interval '50 minutes'
from
    public.students
where
    user_id = '6e5db200-2171-4333-bb6d-3ab18f91a70e';

insert into
    public.sessions (
        tutor_id,
        student_id,
        topic,
        starts_at,
        ends_at,
        status,
        live_notes,
        completed_at,
        reviewed_at
    )
select
    'e66b99a8-c672-4884-a141-8cc0e8271c91',
    students.id,
    'Factorisation',
    now () - interval '3 days',
    now () - interval '3 days' + interval '60 minutes',
    'ai_reviewed',
    'Maya can factorise expressions with a simple common factor. She still needs prompting where the highest common factor is not immediately obvious.',
    now () - interval '3 days' + interval '60 minutes',
    now () - interval '3 days' + interval '65 minutes'
from
    public.students
where
    user_id = '6e5db200-2171-4333-bb6d-3ab18f91a70e';

insert into
    public.sessions (
        tutor_id,
        student_id,
        topic,
        starts_at,
        ends_at,
        status,
        live_notes
    )
select
    'e66b99a8-c672-4884-a141-8cc0e8271c91',
    students.id,
    'Quadratic equations',
    now () + interval '2 days',
    now () + interval '2 days' + interval '60 minutes',
    'scheduled',
    ''
from
    public.students
where
    user_id = '6e5db200-2171-4333-bb6d-3ab18f91a70e';

-- =========================================================
-- Historical AI debriefs
-- =========================================================

insert into public.session_debriefs (
    session_id,
    summary,
    homework,
    next_focus,
    model
)
select
    id,
    'Maya improved her understanding of maintaining equality while solving linear equations. She is secure with one-step equations and made noticeable progress with two-step problems.',
    '[
        "Complete five two-step equation problems",
        "Check each solution by substituting it back into the original equation"
    ]'::jsonb,
    'Continue building fluency with multi-step equations before introducing equations containing brackets.',
    'seed-data'
from public.sessions
where topic = 'Linear equations';


insert into public.session_debriefs (
    session_id,
    summary,
    homework,
    next_focus,
    model
)
select
    id,
    'Maya became confident expanding single brackets but made occasional sign mistakes when negative coefficients were involved.',
    '[
        "Expand six expressions containing negative coefficients",
        "Highlight the sign of each term before multiplying"
    ]'::jsonb,
    'Consolidate negative coefficients and connect expanding brackets with reverse factorisation.',
    'seed-data'
from public.sessions
where topic = 'Expanding brackets';


insert into public.session_debriefs (
    session_id,
    summary,
    homework,
    next_focus,
    model
)
select
    id,
    'Maya can factorise expressions where the common factor is obvious. She needs more practice identifying the highest common factor independently.',
    '[
        "Factorise eight expressions with different common factors",
        "For each question write down the highest common factor before factorising"
    ]'::jsonb,
    'Strengthen factorisation before connecting factorised expressions to quadratic equations.',
    'seed-data'
from public.sessions
where topic = 'Factorisation';