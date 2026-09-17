"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {
    success: false,
};

export default function LoginForm() {
    const [showPassword, setShowPassword] =
        useState(false);

    const [state, action, pending] = useActionState(
        login,
        initialState,
    );

    return (
        <form action={action} className="space-y-5">
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                >
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={pending}
                    placeholder="you@example.com"
                    className="
                        h-11 w-full rounded-lg border border-gray-200
                        bg-white px-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        hover:border-gray-300
                        focus:border-gray-900
                        focus:ring-2 focus:ring-gray-900/10
                        disabled:cursor-not-allowed
                        disabled:bg-gray-50
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
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        disabled={pending}
                        placeholder="Enter your password"
                        className="
                            h-11 w-full rounded-lg
                            border border-gray-200 bg-white
                            px-3 pr-11 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-gray-900
                            focus:ring-2 focus:ring-gray-900/10
                            disabled:cursor-not-allowed
                            disabled:bg-gray-50
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

            {state.message && !state.success && (
                <div
                    role="alert"
                    className="
                        rounded-lg border border-red-200
                        bg-red-50 px-3 py-2.5
                        text-sm text-red-700
                    "
                >
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={pending}
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
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}

                {pending ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
}