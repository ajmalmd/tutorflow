import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const instant = false;

export default async function LoginPage() {
    const currentUser = await getCurrentUser();

    if (currentUser?.profile.role === "tutor") {
        redirect("/tutor");
    }

    if (currentUser?.profile.role === "student") {
        redirect("/student");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold">TutorFlow</h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to continue.
                    </p>
                </div>

                <LoginForm />
            </div>
        </main>
    );
}