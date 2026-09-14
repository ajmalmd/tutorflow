import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { ScheduleSessionForm } from "@/components/sessions/schedule-session-form";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";

export const instant = false;

type TutorStudentDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
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

    return (
        <main className="mx-auto max-w-5xl p-8">
            <div className="mb-6">
                <Link
                    href="/tutor"
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    ← Back to students
                </Link>
            </div>

            <header className="mb-8">
                <p className="text-sm text-gray-500">
                    Student
                </p>

                <h1 className="mt-1 text-3xl font-semibold">
                    {student.name}
                </h1>

                <p className="mt-2 text-gray-600">
                    {student.subject} · {student.current_level}
                </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="space-y-8">
                    <section className="rounded-xl border bg-white p-6">
                        <h2 className="text-lg font-semibold">
                            Learning profile
                        </h2>

                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Learning goals
                                </p>

                                <p className="mt-1 whitespace-pre-wrap">
                                    {student.learning_goals ||
                                        "No learning goals added yet."}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Weak areas
                                </p>

                                <p className="mt-1 whitespace-pre-wrap">
                                    {student.weak_areas ||
                                        "No weak areas added yet."}
                                </p>
                            </div>
                        </div>
                    </section>

                    {inProgressSessions.length > 0 && (
                        <SessionList
                            title="Current session"
                            sessions={inProgressSessions}
                            emptyMessage=""
                        />
                    )}

                    {readyToStartSessions.length > 0 && (
                        <SessionList
                            title="Ready to Start"
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

                <aside>
                    <ScheduleSessionForm
                        studentId={student.id}
                    />
                </aside>
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
            <h2 className="mb-4 text-xl font-semibold">
                {title}
            </h2>

            {sessions.length === 0 ? (
                <div className="rounded-xl border bg-white p-5 text-sm text-gray-500">
                    {emptyMessage}
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
                                className="block rounded-xl border bg-white p-5 transition hover:border-gray-400"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-medium">
                                            {session.topic}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {startsAt.toLocaleString()}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {durationMinutes} minutes
                                        </p>
                                    </div>

                                    <SessionStatusBadge status={session.status} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}