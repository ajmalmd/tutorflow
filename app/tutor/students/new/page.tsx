import Link from "next/link";

import { requireTutor } from "@/lib/auth/get-current-user";

import { ArrowLeft, UserPlus } from "lucide-react";

import { CreateStudentForm } from "@/components/students/create-student-form";

export const instant = false;

export default async function NewStudentPage() {
    await requireTutor();

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Back */}
                <Link
                    href="/tutor"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>

                {/* Header */}
                <header className="mb-8 mt-6">
                    <div className="flex items-start gap-4">
                        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm sm:flex">
                            <UserPlus className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Tutor
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                Create student
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                                Create a student account and set up their
                                learning profile.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Form */}
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <CreateStudentForm />
                </section>
            </div>
        </main>
    );
}