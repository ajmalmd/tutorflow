import Link from "next/link";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import {
    ArrowRight,
    CalendarDays,
    Clock,
    GraduationCap,
    Plus,
    Users,
} from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";

export const instant = false;

export default async function TutorDashboardPage() {
    const currentUser = await requireTutor();

    const supabase = await createClient();

    const { data: students, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            subject,
            current_level
        `)
        .order("name");

    if (error) {
        throw new Error(error.message);
    }

    const { data: dashboardSessions, error: sessionsError } =
        await supabase
            .from("sessions")
            .select(`
            id,
            student_id,
            topic,
            starts_at,
            ends_at,
            status
        `)
            .in("status", [
                "scheduled",
                "in_progress",
            ])
            .order("starts_at", {
                ascending: true,
            })
            .limit(10);

    if (sessionsError) {
        throw new Error(sessionsError.message);
    }

    const studentsById = new Map(
        students.map((student) => [
            student.id,
            student,
        ]),
    );

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header */}
                <header className="mb-10 flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm sm:flex">
                            <GraduationCap className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Tutor portal
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                Welcome, {currentUser.profile.full_name}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Manage your students and tutoring sessions.
                            </p>
                        </div>
                    </div>

                    <LogoutButton />
                </header>

                {/* Students */}
                <section>
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />

                                <h2 className="text-lg font-semibold text-gray-900">
                                    Students
                                </h2>

                                {students.length > 0 && (
                                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                        {students.length}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                View learning profiles and manage sessions.
                            </p>
                        </div>

                        <Link
                            href="/tutor/students/new"
                            className="
                        inline-flex h-10 shrink-0 items-center
                        justify-center gap-2 rounded-lg
                        bg-gray-900 px-4 text-sm font-medium
                        text-white transition
                        hover:bg-gray-800
                        focus:outline-none focus:ring-2
                        focus:ring-gray-900 focus:ring-offset-2
                    "
                        >
                            <Plus className="h-4 w-4" />

                            <span className="hidden sm:inline">
                                Create student
                            </span>

                            <span className="sm:hidden">
                                Create
                            </span>
                        </Link>
                    </div>

                    {students.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <Users className="h-5 w-5 text-gray-400" />
                            </div>

                            <h3 className="mt-3 text-sm font-medium text-gray-900">
                                No students yet
                            </h3>

                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
                                Create your first student to start scheduling
                                tutoring sessions.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {students.map((student) => (
                                <Link
                                    key={student.id}
                                    href={`/tutor/students/${student.id}`}
                                    className="
                                group rounded-xl border border-gray-200
                                bg-white p-5 shadow-sm transition
                                hover:border-gray-300 hover:shadow-md
                                focus:outline-none
                                focus:ring-2 focus:ring-gray-900/10
                            "
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                                <GraduationCap className="h-5 w-5 text-gray-500" />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {student.name}
                                                </h3>

                                                <p className="mt-0.5 truncate text-sm text-gray-500">
                                                    {student.subject}
                                                    {" · "}
                                                    {student.current_level}
                                                </p>
                                            </div>
                                        </div>

                                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Sessions */}
                <section className="mt-10">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-gray-500" />

                            <h2 className="text-lg font-semibold text-gray-900">
                                Sessions
                            </h2>

                            {dashboardSessions.length > 0 && (
                                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                    {dashboardSessions.length}
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Active, ready-to-start, and upcoming sessions.
                        </p>
                    </div>

                    {dashboardSessions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
                            <CalendarDays className="mx-auto h-6 w-6 text-gray-300" />

                            <h3 className="mt-3 text-sm font-medium text-gray-900">
                                No sessions scheduled
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Upcoming sessions will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dashboardSessions.map((session) => {
                                const student = studentsById.get(
                                    session.student_id,
                                );

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
                                                {/* Student */}
                                                <p className="mb-1 text-xs font-medium text-gray-400">
                                                    {student?.name ??
                                                        "Student"}
                                                </p>

                                                {/* Topic */}
                                                <h3 className="truncate font-semibold text-gray-900">
                                                    {session.topic}
                                                </h3>

                                                {/* Date / time */}
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
            </div>
        </main>
    );
}