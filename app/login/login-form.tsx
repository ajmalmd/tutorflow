"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.replace("/");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function fillTutorDemo() {
        setEmail("tutor@tutorflow.demo");
        setPassword("TutorFlow123!");
    }

    function fillStudentDemo() {
        setEmail("student@tutorflow.demo");
        setPassword("Student123!");
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div>
                <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium"
                >
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium"
                >
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                />
            </div>

            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={fillTutorDemo}
                    className="rounded-lg border px-3 py-2 text-sm"
                >
                    Tutor demo
                </button>

                <button
                    type="button"
                    onClick={fillStudentDemo}
                    className="rounded-lg border px-3 py-2 text-sm"
                >
                    Student demo
                </button>
            </div>
        </form>
    );
}