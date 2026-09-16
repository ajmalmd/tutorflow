import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    BookOpen,
    GraduationCap,
    Target,
    TriangleAlert,
} from "lucide-react";

import { ScheduleSessionForm } from "@/components/sessions/schedule-session-form";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { ProgressSummaryCard } from "@/components/students/progress-summary-card";

export const instant = false;

type TutorStudentDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function TutorStudentDetailPage({ params }: TutorStudentDetailPageProps) {
    const { id } = await params;

    const currentUser = await requireTutor();

    const supabase = await createClient();

    // -----------------------------------------------------
    // Explicit ownership guard.
    //
    // RLS already protects this query, but keeping tutor_id
    // here makes the route's ownership requirement obvious.
    // -----------------------------------------------------

    const { data: student, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            subject,
            current_level,
            learning_goals,
            weak_areas
        `)
        .eq("id", id)
        .eq("tutor_id", currentUser.user.id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!student) {
        notFound();
    }

    const { data: sessions, error: sessionsError } =
        await supabase
            .from("sessions")
            .select(`
                id,
                topic,
                starts_at,
                ends_at,
                status
            `)
            .eq("student_id", student.id)
            .order("starts_at", {
                ascending: true,
            });

    if (sessionsError) {
        throw new Error(sessionsError.message);
    }

    const now = new Date();

    const inProgressSessions = sessions.filter(
        (session) => session.status === "in_progress",
    );

    const readyToStartSessions = sessions.filter(
        (session) =>
            session.status === "scheduled" &&
            new Date(session.starts_at).getTime() <= now.getTime(),
    );

    const upcomingSessions = sessions.filter(
        (session) =>
            session.status === "scheduled" &&
            new Date(session.starts_at).getTime() > now.getTime(),
    );

    const pastSessions = sessions.filter(
        (session) =>
            session.status === "completed" ||
            session.status === "ai_reviewed",
    );

    const hasReviewedSessions = sessions.some(
        (session) => session.status === "ai_reviewed",
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Back */}
                <Link
                    href="/tutor"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to students
                </Link>

                {/* Student header */}
                <header className="mb-8 mt-6">
                    <div className="flex items-start gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm sm:flex">
                            <GraduationCap className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Student
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                {student.name}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span>{student.subject}</span>

                                <span className="h-1 w-1 rounded-full bg-gray-300" />

                                <span>{student.current_level}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    {/* Main content */}
                    <div className="min-w-0 space-y-8">
                        {/* Learning profile */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                    <BookOpen className="h-4 w-4 text-gray-600" />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Learning profile
                                    </h2>

                                    <p className="mt-0.5 text-sm text-gray-500">
                                        Goals and areas to focus on during sessions.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {/* Goals */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-500" />

                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Learning goals
                                        </h3>
                                    </div>

                                    {student.learning_goals ? (
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                            {student.learning_goals}
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-sm leading-6 text-gray-400">
                                            No learning goals added yet.
                                        </p>
                                    )}
                                </div>

                                {/* Weak areas */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                    <div className="flex items-center gap-2">
                                        <TriangleAlert className="h-4 w-4 text-gray-500" />

                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Areas to improve
                                        </h3>
                                    </div>

                                    {student.weak_areas ? (
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                                            {student.weak_areas}
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-sm leading-6 text-gray-400">
                                            No areas to improve added yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* AI progress summary */}
                        <ProgressSummaryCard
                            studentId={student.id}
                            hasReviewedSessions={hasReviewedSessions}
                        />

                        {/* Sessions */}
                        <div className="space-y-8">
                            {inProgressSessions.length > 0 && (
                                <SessionList
                                    title="Current session"
                                    sessions={inProgressSessions}
                                    emptyMessage=""
                                />
                            )}

                            {readyToStartSessions.length > 0 && (
                                <SessionList
                                    title="Ready to start"
                                    sessions={readyToStartSessions}
                                    emptyMessage=""
                                />
                            )}

                            <SessionList
                                title="Upcoming sessions"
                                sessions={upcomingSessions}
                                emptyMessage="No upcoming sessions."
                            />

                            <SessionList
                                title="Past sessions"
                                sessions={pastSessions}
                                emptyMessage="No previous sessions."
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <aside className="lg:sticky lg:top-6">
                        <ScheduleSessionForm
                            studentId={student.id}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}

type SessionItem = {
    id: string;
    topic: string;
    starts_at: string;
    ends_at: string;
    status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "ai_reviewed";
};

function SessionList({
    title,
    sessions,
    emptyMessage,
}: {
    title: string;
    sessions: SessionItem[];
    emptyMessage: string;
}) {
    return (
        <section>
            {/* Section heading */}
            <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                </h2>

                {sessions.length > 0 && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {sessions.length}
                    </span>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-6 text-center">
                    <CalendarDays className="mx-auto h-5 w-5 text-gray-300" />

                    <p className="mt-2 text-sm text-gray-500">
                        {emptyMessage}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => {
                        const startsAt = new Date(
                            session.starts_at,
                        );

                        const endsAt = new Date(
                            session.ends_at,
                        );

                        const durationMinutes = Math.round(
                            (endsAt.getTime() -
                                startsAt.getTime()) /
                            60_000,
                        );

                        return (
                            <Link
                                key={session.id}
                                href={`/tutor/sessions/${session.id}`}
                                className="
                                    group block rounded-xl
                                    border border-gray-200
                                    bg-white p-5 shadow-sm
                                    transition
                                    hover:border-gray-300
                                    hover:shadow-md
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-gray-900/10
                                "
                            >
                                <div className="flex items-center justify-between gap-5">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-gray-900">
                                            {session.topic}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />

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
                                                <Clock className="h-3.5 w-3.5 shrink-0" />

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

                                    <div className="flex shrink-0 items-center gap-3">
                                        <SessionStatusBadge
                                            status={
                                                session.status
                                            }
                                            startsAt={
                                                session.starts_at
                                            }
                                        />

                                        <ArrowRight className="hidden h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500 sm:block" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}