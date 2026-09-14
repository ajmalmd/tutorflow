import Link from "next/link";

import { requireTutor } from "@/lib/auth/get-current-user";

import { CreateStudentForm } from "@/components/students/create-student-form";

export const instant = false;

export default async function NewStudentPage() {
    await requireTutor();

    return (
        <main className="mx-auto max-w-2xl p-8">
            <div className="mb-6">
                <Link
                    href="/tutor"
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    ← Back to dashboard
                </Link>
            </div>

            <header className="mb-8">
                <p className="text-sm text-gray-500">
                    Tutor
                </p>

                <h1 className="mt-1 text-3xl font-semibold">
                    Create student
                </h1>

                <p className="mt-2 text-gray-600">
                    Create a student account
                    and learning profile.
                </p>
            </header>

            <section className="rounded-xl border bg-white p-6">
                <CreateStudentForm />
            </section>
        </main>
    );
}