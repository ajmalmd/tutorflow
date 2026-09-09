import { requireStudent } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/logout-button";

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
      current_level,
      learning_goals,
      weak_areas
    `)
        .eq("user_id", currentUser.user.id)
        .single();

    if (error || !student) {
        throw new Error("Student profile not found.");
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
                ascending: false,
            });

    if (sessionsError) {
        throw new Error(sessionsError.message);
    }

    return (
        <main className="mx-auto max-w-5xl p-8">
            <header className="mb-8 flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500">Student portal</p>

                    <h1 className="text-3xl font-semibold">
                        Welcome, {student.name}
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {student.subject} · {student.current_level}
                    </p>
                </div>

                <LogoutButton />
            </header>

            <section>
                <h2 className="mb-4 text-xl font-semibold">
                    Sessions
                </h2>

                <div className="space-y-3">
                    {sessions.map((session) => (
                        <article
                            key={session.id}
                            className="rounded-xl border bg-white p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">
                                        {session.topic}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(
                                            session.starts_at
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                                    {session.status.replace("_", " ")}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}