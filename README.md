# TutorFlow

TutorFlow is an AI-assisted tutoring platform for managing one-to-one students and tutoring sessions.

Tutors can manage student learning profiles, schedule sessions, generate personalized AI lesson plans, take autosaved live notes, generate post-session AI debriefs, and review student progress over time.

Students have a simplified portal where they can view their sessions, completed session information, and AI-generated homework.

## Live Demo

**Live application:**
`https://tutorflow-self.vercel.app/`

**GitHub repository:**
`https://github.com/ajmalmd/tutorflow`

### Test Accounts

#### Tutor

Email: `aaron@tutorflow.com`
Password: `123abcAB`

#### Student

Email: `sam@tutorflow.com`
Password: `123abcAB`

The demo accounts contain sample session data so the main tutor and student workflows can be tested without additional setup.

---

# Features

## Tutor

* Secure tutor authentication
* Create and manage student accounts
* Maintain student learning profiles
* Schedule tutoring sessions
* Tutor double-booking prevention
* Server-enforced session lifecycle
* AI-generated pre-session lesson plans
* Debounced autosaving of live session notes
* AI-generated post-session debriefs
* AI student progress summaries
* Student session timeline

## Student

* Secure student authentication
* Student-specific portal
* View upcoming sessions
* View completed session information
* View AI-generated homework and session feedback
* Read-only access to student-facing session data

---

# Session Lifecycle

Sessions follow a strict lifecycle:

```text
Scheduled
    ↓
In Progress
    ↓
Completed
    ↓
AI Reviewed
```

Lifecycle transitions are enforced in PostgreSQL rather than relying on frontend state alone.

A session cannot skip states.

For example:

```text
Scheduled → Completed       ❌
Scheduled → AI Reviewed     ❌
Completed → In Progress     ❌
```

Only the following transitions are valid:

```text
Scheduled → In Progress
In Progress → Completed
Completed → AI Reviewed
```

Completed sessions are immutable except for the atomic transition to `AI Reviewed`.

AI-reviewed sessions are fully immutable.

Starting, completing, saving live notes, saving AI plans, and saving AI debriefs are handled through controlled PostgreSQL RPC functions with ownership and lifecycle checks.

---

# Tech Stack

### Frontend

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Lucide Icons

### Backend

* Next.js Server Actions
* Supabase
* PostgreSQL
* PostgreSQL Row Level Security
* PostgreSQL RPC functions and triggers

### Authentication

* Supabase Auth

### AI

* Provider-agnostic AI layer
* Gemini / OpenAI support
* Zod validation for structured AI output

### Deployment

* Vercel
* Supabase hosted PostgreSQL

---

# Architecture

TutorFlow uses Next.js for both the frontend and application server layer.

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── Server Components
   ├── Server Actions
   │
   ▼
Supabase
   │
   ├── Auth
   ├── PostgreSQL
   ├── Row Level Security
   ├── RPC Functions
   └── Database Triggers
   │
   ▼
AI Provider
   ├── Gemini
   └── OpenAI
```

Authorization and important business rules are not trusted to the browser.

The frontend controls the user experience, while PostgreSQL constraints, RLS policies, RPC functions, and lifecycle triggers provide the final enforcement layer.

---

# Data Model

The main entities are:

### `profiles`

Maps Supabase Auth users to TutorFlow roles.

Important fields:

```text
id
role (tutor | student)
full_name
```

### `students`

Represents a student's tutoring and learning profile.

```text
id
tutor_id
user_id
name
subject
current_level
learning_goals
weak_areas
```

Each student belongs to one tutor and is linked to a Supabase Auth account.

`user_id` is unique to prevent duplicate student identities.

### `sessions`

Represents a tutoring session.

```text
id
tutor_id
student_id
topic
starts_at
ends_at
status
live_notes
completed_at
reviewed_at
```

The session status uses a PostgreSQL enum:

```text
scheduled
in_progress
completed
ai_reviewed
```

### `session_plans`

Stores the AI-generated pre-session lesson plan.

```text
session_id
objectives
lesson_outline
practice_questions
model
```

`session_id` is unique, preventing multiple plans for the same session.

### `session_debriefs`

Stores the AI-generated post-session review.

```text
session_id
summary
homework
next_focus
model
```

`session_id` is unique, preventing duplicate debriefs.

---

# Access Control

TutorFlow uses multiple layers of authorization.

## Route protection

Server-side authentication helpers enforce tutor and student roles.

A student cannot access tutor routes, and tutor-only mutations require an authenticated tutor.

## Row Level Security

Supabase RLS restricts database access based on ownership.

Tutors can access only students and sessions they own.

Student-facing database access is deliberately restricted so internal fields and AI metadata are not exposed unintentionally.

## RPC authorization

Sensitive mutations additionally validate:

* authenticated user
* user role
* tutor ownership
* current session status
* operation-specific requirements

The service-role key is used only in trusted server-side operations and is never exposed to the browser.

---

# Double-Booking Protection

TutorFlow prevents a tutor from having overlapping sessions.

There are two layers of protection.

### Application validation

The scheduling flow checks existing sessions and provides a user-friendly error when an overlap is detected.

### Database constraint

PostgreSQL provides the final race-safe guarantee using a GiST exclusion constraint over the tutor and session time range.

Conceptually:

```text
same tutor
+
overlapping [starts_at, ends_at)
=
rejected
```

Using a half-open interval allows back-to-back sessions:

```text
10:00 → 11:00
11:00 → 12:00
```

while preventing actual overlaps.

---

# Live Notes and Autosave

Tutor notes are editable only while a session is `in_progress`.

The editor uses debounced autosave rather than saving on every keystroke.

```text
Tutor types
     ↓
debounce
     ↓
Server Action
     ↓
PostgreSQL RPC
     ↓
persist live_notes
```

The database RPC verifies that:

* the caller is authenticated
* the caller is the tutor who owns the session
* the session is currently `in_progress`

A session also cannot be completed until meaningful notes have been persisted.

The UI waits for pending note changes to save before enabling completion, while the database independently enforces the persisted-note requirement.

---

# AI Integration

AI is used at three points in the tutoring workflow.

## 1. Pre-session lesson plan

Before starting a scheduled session, the tutor can generate a personalized lesson plan.

The AI receives contextual information including:

* subject
* current student level
* learning goals
* weak areas
* current session topic
* session duration
* relevant previous session history

The structured result contains:

* learning objectives
* four-point lesson outline
* three practice questions

The purpose of providing the student profile and history is to avoid generic lesson plans and make the generated material relevant to the individual student.

## 2. Post-session debrief

After the tutor completes a session, the AI receives the tutor's persisted live notes together with relevant student and session context.

It produces structured output containing:

* session summary
* two to three homework tasks
* recommended focus for the next session

The prompt explicitly prevents the model from inventing student performance that is not supported by the tutor's notes or available context.

The debrief is persisted and the lifecycle transition:

```text
completed → ai_reviewed
```

occurs atomically in PostgreSQL.

If persistence fails, the session is not partially transitioned into an AI-reviewed state.

## 3. Student progress summary

The tutor can request an AI-generated progress summary from the student's reviewed session history.

The AI receives previous debriefs in chronological context and identifies:

* overall progress
* improvements
* recurring challenges
* recommended areas of focus

The prompt requires conclusions to remain grounded in the available session history rather than inventing trends.

---

# Structured AI Output

AI responses are not treated as arbitrary text.

TutorFlow defines structured schemas using Zod and validates model output before it is used or persisted.

This provides predictable data structures for:

* lesson plans
* homework
* debriefs
* progress summaries

The AI layer is provider-agnostic so the application can switch between supported providers through server-side configuration without changing the tutoring workflow.

---

# Error Handling

The application handles failures at multiple levels.

Examples include:

* invalid form data
* unauthorized access
* invalid lifecycle transitions
* session scheduling conflicts
* failed autosaves
* duplicate AI generation
* malformed AI responses
* AI provider failures
* database persistence failures

Internal provider/database errors are logged server-side while the UI returns user-safe messages.

Critical business rules remain enforced by PostgreSQL even if frontend controls are bypassed.

---

# Key Architectural Decisions

## Supabase instead of a separate API server

Next.js and Supabase were chosen to reduce infrastructure overhead while still providing PostgreSQL, authentication, RLS, migrations, and server-side database functions.

This allowed more implementation time to be spent on lifecycle integrity and AI context quality.

## Database-enforced lifecycle

Session transitions are business rules rather than presentation rules.

For that reason, the final enforcement lives in PostgreSQL instead of relying solely on disabled frontend buttons.

## RPCs for sensitive mutations

Important operations such as session transitions and AI artifact persistence use PostgreSQL functions.

This provides atomicity and keeps authorization and lifecycle validation close to the data.

## Database-level double-booking protection

Application-level overlap checks improve UX, but they cannot fully protect against concurrent requests.

A PostgreSQL exclusion constraint provides the final race-safe guarantee.

## Provider-independent AI layer

AI generation is separated from the rest of the application through a provider abstraction.

This prevents session business logic from becoming tightly coupled to one AI vendor.

---

# Tradeoffs

TutorFlow was implemented as a focused take-home project, so several production features were intentionally kept outside the scope.

The application currently favors simple server-rendered flows and Server Actions rather than introducing a separate backend API.

AI progress analysis is generated on demand rather than permanently stored because it is derived from existing debrief history and may change as additional sessions are reviewed.

Student creation uses privileged server-side Supabase administration because public registration is intentionally disabled.

The application prioritizes server-side correctness and authorization over complex client-side state management.

---

# Local Development

Although the deployed application can be tested without local setup, the project can also be run locally.

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a local environment file containing the required Supabase and AI configuration.

For example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

AI_PROVIDER=

OPENAI_API_KEY=
OPENAI_MODEL=

GEMINI_API_KEY=
GEMINI_MODEL=
```

Only configure the variables required by the selected AI provider.

Never expose service-role or AI API keys through `NEXT_PUBLIC_*` variables.

### Apply database migrations

The database schema is managed using Supabase CLI migrations.

```bash
supabase db push
```

### Start development server

```bash
npm run dev
```

---

# What I Would Build Next

With another day, I would add student notifications for newly scheduled and rescheduled sessions, including calendar-friendly reminders. I would add stronger observability around AI requests and autosave failures so operational issues could be identified without exposing provider details to users. I would introduce automated integration tests covering authorization boundaries, lifecycle transitions, double-booking, and concurrent AI generation. I would improve the progress experience with longitudinal indicators derived from reviewed session history while keeping AI conclusions traceable to their source sessions. Finally, I would add tutor-facing controls for editing student learning profiles and managing future sessions without weakening the lifecycle guarantees already enforced by the database.

---

# Submission

Built as a full-stack take-home project demonstrating:

* multi-role authentication and authorization
* relational data modeling
* database-enforced business rules
* race-safe scheduling
* structured contextual AI integration
* debounced persistence
* server-side security
* production deployment
