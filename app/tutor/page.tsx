import Link from "next/link";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
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
        <main className="mx-auto max-w-5xl p-8">
            <header className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">Tutor portal</p>

                    <h1 className="text-3xl font-semibold">
                        Welcome, {currentUser.profile.full_name}
                    </h1>
                </div>

                <LogoutButton />
            </header>

            <section>
                <h2 className="mb-4 text-xl font-semibold">Your students</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {students.map((student) => (
                        <Link
                            key={student.id}
                            href={`/tutor/students/${student.id}`}
                            className="block rounded-xl border bg-white p-5 transition hover:border-gray-400"
                        >
                            <h3 className="font-semibold">
                                {student.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                {student.subject} · {student.current_level}
                            </p>
                        </Link>

                    ))}
                </div>
            </section>
            <section className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">
                    Active & upcoming sessions
                </h2>

                {dashboardSessions.length === 0 ? (
                    <div className="rounded-xl border bg-white p-5 text-sm text-gray-500">
                        No active or upcoming sessions.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dashboardSessions.map((session) => {
                            const student = studentsById.get(
                                session.student_id,
                            );

                            return (
                                <Link
                                    key={session.id}
                                    href={`/tutor/sessions/${session.id}`}
                                    className="flex items-center justify-between gap-4 rounded-xl border bg-white p-5 transition hover:border-gray-400"
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            {session.topic}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {student?.name ?? "Student"} ·{" "}
                                            {new Date(
                                                session.starts_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <SessionStatusBadge
                                        status={session.status}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}