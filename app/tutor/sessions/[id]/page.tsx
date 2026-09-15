import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock,
    GraduationCap,
    NotebookPen,
    Sparkles,
} from "lucide-react";

import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { GeneratePlanButton } from "@/components/sessions/generate-plan-button";
import { GenerateReviewButton } from "@/components/sessions/generate-review-button";

import { SessionNotesProvider } from "@/components/sessions/session-notes-context";

import { SessionLifecycleActions } from "@/components/sessions/session-lifecycle-actions";

import { AISessionPlan } from "@/components/sessions/ai-session-plan";
import { LiveNotes } from "@/components/sessions/live-notes";
import { AISessionReview } from "@/components/sessions/ai-session-review";


import { SessionPlanSchema } from "@/lib/ai/schemas/session-plan";
import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";

export const instant = false;

type TutorSessionDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function TutorSessionDetailPage({ params }: TutorSessionDetailPageProps) {
    const { id } = await params;

    const currentUser = await requireTutor();

    const supabase = await createClient();

    // -----------------------------------------------------
    // Explicit ownership check.
    //
    // RLS also prevents Tutor A from reading Tutor B's
    // session, but keeping tutor_id here makes the route
    // requirement explicit.
    // -----------------------------------------------------

    // fetch session
    const {
        data: session,
        error: sessionError,
    } = await supabase
        .from("sessions")
        .select(`
            id,
            student_id,
            topic,
            starts_at,
            ends_at,
            status,
            live_notes,
            completed_at,
            reviewed_at
        `)
        .eq("id", id)
        .eq("tutor_id", currentUser.user.id)
        .maybeSingle();

    if (sessionError) {
        throw new Error(sessionError.message);
    }

    if (!session) {
        notFound();
    }

    // fetch student
    const {
        data: student,
        error: studentError,
    } = await supabase
        .from("students")
        .select(`
            id,
            name,
            subject,
            current_level
        `)
        .eq("id", session.student_id)
        .eq("tutor_id", currentUser.user.id)
        .maybeSingle();

    if (studentError) {
        throw new Error(studentError.message);
    }

    if (!student) {
        notFound();
    }

    // fetch session plan
    const {
        data: sessionPlan,
        error: sessionPlanError,
    } = await supabase
        .from("session_plans")
        .select(`
            id,
            objectives,
            lesson_outline,
            practice_questions,
            model,
            created_at
        `)
        .eq("session_id", session.id)
        .maybeSingle();

    if (sessionPlanError) {
        throw new Error(
            sessionPlanError.message,
        );
    }


    // fetch session debrief
    const {
        data: sessionDebrief,
        error: sessionDebriefError,
    } = await supabase
        .from("session_debriefs")
        .select(`
            id,
            summary,
            homework,
            next_focus,
            model,
            created_at
        `)
        .eq(
            "session_id",
            session.id,
        )
        .maybeSingle();

    if (sessionDebriefError) {
        throw new Error(
            sessionDebriefError.message,
        );
    }


    const parsedSessionPlan =
        sessionPlan
            ? SessionPlanSchema.safeParse({
                objectives:
                    sessionPlan.objectives,

                lesson_outline:
                    sessionPlan.lesson_outline,

                practice_questions:
                    sessionPlan.practice_questions,
            })
            : null;

    const parsedSessionDebrief =
        sessionDebrief
            ? SessionDebriefSchema.safeParse({
                summary: sessionDebrief.summary,
                homework: sessionDebrief.homework,
                next_focus: sessionDebrief.next_focus,
            })
            : null;


    const startsAt = new Date(session.starts_at);
    const endsAt = new Date(session.ends_at);

    const now = new Date();

    const canStart =
        session.status === "scheduled" &&
        startsAt.getTime() <= now.getTime();

    const canGeneratePlan = session.status === "scheduled" && !sessionPlan;

    const hasUsefulNotes = session.live_notes.trim().length >= 10;

    const durationMinutes = Math.round(
        (endsAt.getTime() - startsAt.getTime()) / 60_000
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Back */}
                <Link
                    href={`/tutor/students/${student.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {student.name}
                </Link>

                {/* Header */}
                <header className="mb-8 mt-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-500">
                                Session with {student.name}
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                {session.topic}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-4 w-4" />

                                    {startsAt.toLocaleDateString(undefined, {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />

                                    {startsAt.toLocaleTimeString(undefined, {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}

                                    {" – "}

                                    {endsAt.toLocaleTimeString(undefined, {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>

                        <SessionStatusBadge
                            status={session.status}
                            startsAt={session.starts_at}
                        />
                    </div>
                </header>

                <SessionNotesProvider initialNotes={session.live_notes}>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        {/* Main content */}
                        <div className="min-w-0 space-y-6">
                            {/* Session details */}
                            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                        <GraduationCap className="h-4 w-4 text-gray-600" />
                                    </div>

                                    <h2 className="font-semibold text-gray-900">
                                        Session details
                                    </h2>
                                </div>

                                <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                    <DetailItem
                                        label="Student"
                                        value={student.name}
                                    />

                                    <DetailItem
                                        label="Subject"
                                        value={student.subject}
                                    />

                                    <DetailItem
                                        label="Duration"
                                        value={`${durationMinutes} minutes`}
                                    />

                                    <DetailItem
                                        label="Starts"
                                        value={startsAt.toLocaleString()}
                                    />

                                    <DetailItem
                                        label="Ends"
                                        value={endsAt.toLocaleString()}
                                    />

                                    {session.completed_at && (
                                        <DetailItem
                                            label="Completed"
                                            value={new Date(
                                                session.completed_at,
                                            ).toLocaleString()}
                                        />
                                    )}

                                    {session.reviewed_at && (
                                        <DetailItem
                                            label="AI reviewed"
                                            value={new Date(
                                                session.reviewed_at,
                                            ).toLocaleString()}
                                        />
                                    )}
                                </dl>
                            </section>

                            {/* AI plan */}
                            {parsedSessionPlan?.success && (
                                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 sm:px-6">
                                        <Sparkles className="h-4 w-4 text-gray-500" />

                                        <h2 className="font-semibold text-gray-900">
                                            Session plan
                                        </h2>

                                        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                            AI generated
                                        </span>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <AISessionPlan
                                            plan={parsedSessionPlan.data}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* AI review */}
                            {parsedSessionDebrief?.success && (
                                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 sm:px-6">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                                        <h2 className="font-semibold text-gray-900">
                                            Session review
                                        </h2>

                                        <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            Reviewed
                                        </span>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <AISessionReview
                                            review={parsedSessionDebrief.data}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Live notes */}
                            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <NotebookPen className="h-4 w-4 text-gray-600" />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                Live notes
                                            </h2>

                                            {session.status === "scheduled" && (
                                                <p className="mt-0.5 text-sm text-gray-500">
                                                    Notes become editable once the
                                                    session starts.
                                                </p>
                                            )}

                                            {session.status === "in_progress" && (
                                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Changes are saved automatically.
                                                </p>
                                            )}

                                            {(session.status === "completed" ||
                                                session.status === "ai_reviewed") && (
                                                    <p className="mt-0.5 text-sm text-gray-500">
                                                        Session complete · Notes are
                                                        read-only.
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                <LiveNotes
                                    sessionId={session.id}
                                    editable={session.status === "in_progress"}
                                />
                            </section>
                        </div>

                        {/* Actions */}
                        <aside className="lg:sticky lg:top-6">
                            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Session actions
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Manage the current stage of this session.
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <SessionLifecycleActions
                                        sessionId={session.id}
                                        status={session.status}
                                        canStart={canStart}
                                    />

                                    {canGeneratePlan && (
                                        <div className="mt-5 border-t border-gray-100 pt-5">
                                            <p className="mb-3 text-sm leading-5 text-gray-500">
                                                Prepare objectives, lesson structure,
                                                and practice questions before the
                                                session.
                                            </p>

                                            <GeneratePlanButton
                                                sessionId={session.id}
                                            />
                                        </div>
                                    )}

                                    {session.status === "completed" &&
                                        !sessionDebrief && (
                                            <div className="mt-5 border-t border-gray-100 pt-5">
                                                <p className="mb-3 text-sm leading-5 text-gray-500">
                                                    Generate a review from your
                                                    session notes to complete this
                                                    session.
                                                </p>

                                                <GenerateReviewButton
                                                    sessionId={session.id}
                                                />
                                            </div>
                                        )}

                                    {session.status === "ai_reviewed" && (
                                        <div className="mt-5 flex items-start gap-2 border-t border-gray-100 pt-5">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Session reviewed
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                                    This session is complete and
                                                    read-only.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </SessionNotesProvider>
            </div>
        </main>
    );
}

function DetailItem({ label, value }: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </dt>

            <dd className="mt-1.5 text-sm font-medium text-gray-800">
                {value}
            </dd>
        </div>
    );
}