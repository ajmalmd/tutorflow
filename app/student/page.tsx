import { requireStudent } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "@/components/ui/logout-button";
import { StudentReviewedSession } from "@/components/sessions/student-reviewed-session";

import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";
import {
    getStudentDebriefs,
    getStudentSessions,
} from "@/lib/data/student-sessions";

export const instant = false;

export default async function StudentDashboardPage() {
    const currentUser = await requireStudent();

    const supabase = await createClient();

    const { data: student, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            subject,
            current_level
        `)
        .eq("user_id", currentUser.user.id)
        .single();

    if (error || !student) {
        throw new Error("Student profile not found.");
    }

    const sessions = await getStudentSessions();

    const hasReviewedSessions = sessions.some(
        (session) => session.status === "ai_reviewed",
    );

    const debriefs = hasReviewedSessions
        ? await getStudentDebriefs()
        : [];

    const reviewBySessionId = new Map<
        string,
        {
            summary: string;
            homework: {
                task: string;
                instructions: string;
            }[];
            next_focus: string;
        }
    >();

    for (const debrief of debriefs) {
        const parsed = SessionDebriefSchema.safeParse({
            summary: debrief.summary,
            homework: debrief.homework,
            next_focus: debrief.next_focus,
        });

        if (!parsed.success) {
            console.error(
                "Invalid stored session debrief:",
                {
                    sessionId: debrief.session_id,
                    error: parsed.error,
                },
            );

            continue;
        }

        reviewBySessionId.set(
            debrief.session_id,
            parsed.data,
        );
    }

    const upcomingSessions = sessions.filter(
        (session) =>
            session.status === "scheduled" ||
            session.status === "in_progress",
    );

    const completedSessions = sessions.filter(
        (session) =>
            session.status === "completed" ||
            session.status === "ai_reviewed",
    );

    return (
        <main className="mx-auto max-w-5xl p-8">
            <header className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        Student portal
                    </p>

                    <h1 className="text-3xl font-semibold">
                        Welcome, {student.name}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {student.subject} · {student.current_level}
                    </p>
                </div>

                <LogoutButton />
            </header>

            {upcomingSessions.length > 0 && (
                <section>
                    <h2 className="mb-4 text-xl font-semibold">
                        Upcoming Sessions
                    </h2>

                    <div className="space-y-3">
                        {upcomingSessions.map((session) => (
                            <article
                                key={session.id}
                                className="rounded-xl border bg-white p-5"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-medium">
                                            {session.topic}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {new Date(
                                                session.starts_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                                        {session.status === "in_progress"
                                            ? "In progress"
                                            : "Scheduled"}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {completedSessions.length > 0 && (
                <section className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold">
                        Previous Sessions
                    </h2>

                    <div className="space-y-3">
                        {completedSessions.map((session) => {
                            const startsAt = new Date(
                                session.starts_at,
                            );

                            const endsAt = new Date(
                                session.ends_at,
                            );

                            const durationMinutes = Math.round(
                                (
                                    endsAt.getTime() -
                                    startsAt.getTime()
                                ) / 60_000,
                            );

                            const review = reviewBySessionId.get(
                                session.id,
                            );

                            if (session.status === "ai_reviewed" && review) {
                                return (
                                    <StudentReviewedSession
                                        key={session.id}
                                        topic={session.topic}
                                        startsAt={session.starts_at}
                                        durationMinutes={durationMinutes}
                                        review={review}
                                    />
                                );
                            }

                            if (session.status === "ai_reviewed" && !review) {
                                return (
                                    <article
                                        key={session.id}
                                        className="rounded-xl border bg-white p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {session.topic}
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    {startsAt.toLocaleString()}
                                                    {" · "}
                                                    {durationMinutes} minutes
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                Review unavailable
                                            </span>
                                        </div>
                                    </article>
                                );
                            }

                            return (
                                <article
                                    key={session.id}
                                    className="rounded-xl border bg-white p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold">
                                                {session.topic}
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-500">
                                                {startsAt.toLocaleString()}{" · "}{durationMinutes} minutes
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                            Awaiting review
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm text-gray-500">
                                        Your tutor is preparing the
                                        session review.
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {sessions.length === 0 && (
                <section className="rounded-xl border bg-white p-6">
                    <h2 className="font-semibold">
                        No sessions yet
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Your scheduled tutoring sessions will appear here.
                    </p>
                </section>
            )}
        </main>
    );
}