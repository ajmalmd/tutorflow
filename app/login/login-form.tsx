"use client";

import { SyntheticEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({ email, password });

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

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                >
                    Email address
                </label>

                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="
                        h-11 w-full rounded-lg border border-gray-200
                        bg-white px-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        hover:border-gray-300
                        focus:border-gray-900
                        focus:ring-2 focus:ring-gray-900/10
                    "
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                >
                    Password
                </label>

                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="
                            h-11 w-full rounded-lg border border-gray-200
                            bg-white px-3 pr-11 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-gray-900
                            focus:ring-2 focus:ring-gray-900/10
                        "
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                        className="
                            absolute right-3 top-1/2 -translate-y-1/2
                            rounded-md p-1 text-gray-400 transition
                            hover:bg-gray-100 hover:text-gray-700
                        "
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="
                        rounded-lg border border-red-200
                        bg-red-50 px-3 py-2.5
                        text-sm text-red-700
                    "
                >
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="
                    flex h-11 w-full items-center justify-center gap-2
                    rounded-lg bg-gray-900 px-4
                    text-sm font-medium text-white
                    transition
                    hover:bg-gray-800
                    focus:outline-none
                    focus:ring-2 focus:ring-gray-900
                    focus:ring-offset-2
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                "
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                {loading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}