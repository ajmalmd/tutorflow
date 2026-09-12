import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { SessionLifecycleActions } from "@/components/sessions/session-lifecycle-actions";

import { LiveNotes } from "@/components/sessions/live-notes";
import { AISessionPlan } from "@/components/sessions/ai-session-plan";
import { GeneratePlanButton } from "@/components/sessions/generate-plan-button";
import { AISessionReview } from "@/components/sessions/ai-session-review";
import { GenerateReviewButton } from "@/components/sessions/generate-review-button";

import { SessionPlanSchema } from "@/lib/ai/schemas/session-plan";
import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";

export const instant = false;

type TutorSessionDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function TutorSessionDetailPage({
    params,
}: TutorSessionDetailPageProps) {
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
                summary:
                    sessionDebrief.summary,

                homework:
                    sessionDebrief.homework,

                next_focus:
                    sessionDebrief.next_focus,
            })
            : null;


    const startsAt = new Date(session.starts_at);
    const endsAt = new Date(session.ends_at);

    const now = new Date();
    const canStart =
        session.status === "scheduled" &&
        startsAt.getTime() <= now.getTime();

    const durationMinutes = Math.round(
        (endsAt.getTime() - startsAt.getTime()) / 60_000,
    );

    return (
        <main className="mx-auto max-w-4xl p-8">
            <div className="mb-6">
                <Link
                    href={`/tutor/students/${student.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    ← Back to {student.name}
                </Link>
            </div>

            <header className="mb-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">
                            Session with {student.name}
                        </p>

                        <h1 className="mt-1 text-3xl font-semibold">
                            {session.topic}
                        </h1>
                    </div>

                    <SessionStatusBadge
                        status={session.status}
                    />
                </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                <div className="space-y-6">
                    <section className="rounded-xl border bg-white p-6">
                        <h2 className="text-lg font-semibold">
                            Session details
                        </h2>

                        <dl className="mt-5 space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">
                                    Student
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {student.name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">
                                    Subject
                                </dt>

                                <dd className="mt-1">
                                    {student.subject}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">
                                    Starts
                                </dt>

                                <dd className="mt-1">
                                    {startsAt.toLocaleString()}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">
                                    Ends
                                </dt>

                                <dd className="mt-1">
                                    {endsAt.toLocaleString()}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500">
                                    Duration
                                </dt>

                                <dd className="mt-1">
                                    {durationMinutes} minutes
                                </dd>
                            </div>

                            {session.completed_at && (
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        Completed
                                    </dt>

                                    <dd className="mt-1">
                                        {new Date(
                                            session.completed_at,
                                        ).toLocaleString()}
                                    </dd>
                                </div>
                            )}

                            {session.reviewed_at && (
                                <div>
                                    <dt className="text-sm text-gray-500">
                                        AI reviewed
                                    </dt>

                                    <dd className="mt-1">
                                        {new Date(
                                            session.reviewed_at,
                                        ).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="rounded-xl border bg-white p-6">

                        <div className="mb-4">
                            {parsedSessionPlan?.success && (
                                <AISessionPlan plan={parsedSessionPlan.data} />
                            )}
                        </div>

                        <div className="mb-4">{parsedSessionDebrief?.success && (
                            <AISessionReview
                                review={
                                    parsedSessionDebrief.data
                                }
                            />
                        )}</div>

                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">
                                Live notes
                            </h2>

                            {session.status === "scheduled" && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Notes become editable after the session starts.
                                </p>
                            )}

                            {session.status === "in_progress" && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Changes are saved automatically.
                                </p>
                            )}

                            {(session.status === "completed" ||
                                session.status === "ai_reviewed") && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        This session is complete. Notes are read-only.
                                    </p>
                                )}
                        </div>

                        <LiveNotes
                            sessionId={session.id}
                            initialNotes={session.live_notes}
                            editable={session.status === "in_progress"}
                        />
                    </section>
                </div>

                <aside>
                    <section className="rounded-xl border bg-white p-6">
                        <h2 className="font-semibold">
                            Session actions
                        </h2>

                        <div className="mt-4">
                            <SessionLifecycleActions
                                sessionId={session.id}
                                status={session.status}
                                canStart={canStart}
                            />

                            {session.status === "scheduled" && !sessionPlan && (
                                <div className="mt-4 border-t pt-4">
                                    <GeneratePlanButton
                                        sessionId={session.id}
                                    />
                                </div>
                            )}

                            {session.status === "completed" && !sessionDebrief && (
                                <div className="mt-4 border-t pt-4">
                                    <p className="mb-3 text-sm text-gray-500">
                                        Session completed. Generate
                                        the post-session review to
                                        finish this session.
                                    </p>

                                    <GenerateReviewButton
                                        sessionId={session.id}
                                    />
                                </div>
                            )}

                            {session.status === "ai_reviewed" && (
                                <p className="mt-4 text-sm text-gray-500">
                                    AI review completed.
                                </p>
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}