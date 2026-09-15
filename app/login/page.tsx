import { GraduationCap } from "lucide-react";
import LoginForm from "./login-form";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-[420px]">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Welcome to TutorFlow
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Sign in to manage your tutoring sessions
                            and learning progress.
                        </p>
                    </div>

                    <LoginForm />
                </div>

                <p className="mt-5 text-center text-xs text-gray-400">
                    AI-assisted tutoring workspace
                </p>
            </div>
        </main>
    );
}