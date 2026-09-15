import { requireStudent } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import {
    BookOpen,
    CalendarDays,
    Clock,
    GraduationCap,
    History,
} from "lucide-react";

import { LogoutButton } from "@/components/ui/logout-button";
import { StudentReviewedSession } from "@/components/sessions/student-reviewed-session";

import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";
import { getStudentDebriefs, getStudentSessions } from "@/lib/data/student-sessions";

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

    const debriefs = hasReviewedSessions ? await getStudentDebriefs() : [];

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
        (session) => session.status === "scheduled" || session.status === "in_progress");

    const completedSessions = sessions.filter(
        (session) => session.status === "completed" || session.status === "ai_reviewed");

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header */}
                <header className="mb-10 flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm sm:flex">
                            <GraduationCap className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-500">
                                Student portal
                            </p>

                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                Welcome, {student.name}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span>{student.subject}</span>

                                <span className="h-1 w-1 rounded-full bg-gray-300" />

                                <span>{student.current_level}</span>
                            </div>
                        </div>
                    </div>

                    <LogoutButton />
                </header>

                {/* Upcoming */}
                {upcomingSessions.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-gray-500" />

                            <h2 className="text-lg font-semibold text-gray-900">
                                Upcoming sessions
                            </h2>

                            <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {upcomingSessions.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {upcomingSessions.map((session) => {
                                const startsAt = new Date(session.starts_at);

                                const endsAt = new Date(session.ends_at);

                                const durationMinutes = Math.round(
                                    (endsAt.getTime() - startsAt.getTime()) / 60_000
                                );

                                const isInProgress = session.status === "in_progress";

                                return (
                                    <article
                                        key={session.id}
                                        className="
                                            rounded-xl border border-gray-200
                                            bg-white p-5 shadow-sm
                                            transition-shadow
                                            hover:shadow-md
                                        "
                                    >
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            <div className="min-w-0">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />

                                                    <h3 className="truncate font-semibold text-gray-900">
                                                        {session.topic}
                                                    </h3>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarDays className="h-3.5 w-3.5" />

                                                        {startsAt.toLocaleDateString(
                                                            undefined,
                                                            {
                                                                weekday:
                                                                    "short",
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />

                                                        {startsAt.toLocaleTimeString(
                                                            undefined,
                                                            {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                            },
                                                        )}

                                                        {" · "}
                                                        {durationMinutes} min
                                                    </span>
                                                </div>
                                            </div>

                                            {isInProgress ? (
                                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                    In progress
                                                </span>
                                            ) : (
                                                <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                    Scheduled
                                                </span>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Previous sessions */}
                {completedSessions.length > 0 && (
                    <section
                        className={
                            upcomingSessions.length > 0 ? "mt-10" : ""
                        }
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-500" />

                            <h2 className="text-lg font-semibold text-gray-900">
                                Previous sessions
                            </h2>

                            <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {completedSessions.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {completedSessions.map((session) => {
                                const startsAt = new Date(session.starts_at);

                                const endsAt = new Date(session.ends_at);

                                const durationMinutes = Math.round(
                                    (endsAt.getTime() - startsAt.getTime()) / 60_000
                                );

                                const review = reviewBySessionId.get(session.id);

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

                                if (
                                    session.status === "ai_reviewed" &&
                                    !review
                                ) {
                                    return (
                                        <article
                                            key={session.id}
                                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                        >
                                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                <SessionInformation
                                                    topic={session.topic}
                                                    startsAt={startsAt}
                                                    durationMinutes={
                                                        durationMinutes
                                                    }
                                                />

                                                <span className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                    Review unavailable
                                                </span>
                                            </div>

                                            <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                                                The review for this session
                                                could not be displayed.
                                            </p>
                                        </article>
                                    );
                                }

                                return (
                                    <article
                                        key={session.id}
                                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                            <SessionInformation
                                                topic={session.topic}
                                                startsAt={startsAt}
                                                durationMinutes={durationMinutes}
                                            />

                                            <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                Awaiting review
                                            </span>
                                        </div>

                                        <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                                            Your tutor is preparing the
                                            session review.
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {sessions.length === 0 && (
                    <section className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
                        <div className="max-w-sm py-12">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                <CalendarDays className="h-5 w-5 text-gray-500" />
                            </div>

                            <h2 className="mt-4 font-semibold text-gray-900">
                                No sessions yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                You don't have any tutoring sessions yet.
                                Upcoming sessions scheduled by your tutor
                                will appear here.
                            </p>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

function SessionInformation({ topic, startsAt, durationMinutes }: {
    topic: string;
    startsAt: Date;
    durationMinutes: number;
}) {
    return (
        <div>
            <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />

                <h3 className="font-semibold text-gray-900">
                    {topic}
                </h3>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />

                    {startsAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>

                <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />

                    {startsAt.toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                    })}

                    {" · "}
                    {durationMinutes} min
                </span>
            </div>
        </div>
    );
}