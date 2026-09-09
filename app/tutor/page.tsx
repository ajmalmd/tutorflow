import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/logout-button";

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
                        <article
                            key={student.id}
                            className="rounded-xl border bg-white p-5"
                        >
                            <h3 className="font-semibold">{student.name}</h3>

                            <p className="mt-1 text-sm text-gray-600">
                                {student.subject} · {student.current_level}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}