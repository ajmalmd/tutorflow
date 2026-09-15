"use client";

import { useState, useActionState } from "react";

import {
    AlertCircle,
    Eye,
    EyeOff,
    Loader2,
    UserPlus,
} from "lucide-react";

import { createStudent, type CreateStudentState } from "@/app/tutor/students/actions";

const initialState: CreateStudentState = { success: false };

export function CreateStudentForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [state, action, pending] = useActionState(
        createStudent, initialState
    );

    return (
        <form
            action={action}
            className="space-y-6"
        >
            {/* Basic information */}
            <div>
                <h2 className="text-sm font-semibold text-gray-900">
                    Student information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Set up the student's account and academic details.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Student name
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        disabled={pending}
                        placeholder="e.g. Alex Johnson"
                        className="
                    mt-2 h-11 w-full rounded-lg
                    border border-gray-200 bg-white px-3
                    text-sm text-gray-900 outline-none transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                "
                    />

                    {state.errors?.name?.[0] && (
                        <FieldError>
                            {state.errors.name[0]}
                        </FieldError>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Student email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={pending}
                        autoComplete="email"
                        placeholder="student@example.com"
                        className="
                    mt-2 h-11 w-full rounded-lg
                    border border-gray-200 bg-white px-3
                    text-sm text-gray-900 outline-none transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                "
                    />

                    {state.errors?.email?.[0] && (
                        <FieldError>
                            {state.errors.email[0]}
                        </FieldError>
                    )}
                </div>
            </div>

            {/* Password */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Temporary password
                </label>

                <div className="relative mt-2">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        disabled={pending}
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                        className="
                    h-11 w-full rounded-lg
                    border border-gray-200 bg-white
                    px-3 pr-10 text-sm text-gray-900
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
                        onClick={() =>
                            setShowPassword((current) => !current)
                        }
                        disabled={pending}
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        className="
                    absolute right-3 top-1/2
                    -translate-y-1/2 text-gray-400
                    transition hover:text-gray-700
                    focus:outline-none
                    disabled:cursor-not-allowed
                "
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    Used when creating the student's login account.
                </p>

                {state.errors?.password?.[0] && (
                    <FieldError>
                        {state.errors.password[0]}
                    </FieldError>
                )}
            </div>

            {/* Subject + level */}
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Subject
                    </label>

                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        disabled={pending}
                        placeholder="e.g. Mathematics"
                        className="
                    mt-2 h-11 w-full rounded-lg
                    border border-gray-200 bg-white px-3
                    text-sm text-gray-900 outline-none transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                "
                    />

                    {state.errors?.subject?.[0] && (
                        <FieldError>
                            {state.errors.subject[0]}
                        </FieldError>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="currentLevel"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Current level
                    </label>

                    <input
                        id="currentLevel"
                        name="currentLevel"
                        type="text"
                        required
                        disabled={pending}
                        placeholder="e.g. Grade 10"
                        className="
                    mt-2 h-11 w-full rounded-lg
                    border border-gray-200 bg-white px-3
                    text-sm text-gray-900 outline-none transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                "
                    />

                    {state.errors?.currentLevel?.[0] && (
                        <FieldError>
                            {state.errors.currentLevel[0]}
                        </FieldError>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Learning profile */}
            <div>
                <h2 className="text-sm font-semibold text-gray-900">
                    Learning profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Add context that will help personalize sessions and AI
                    assistance.
                </p>
            </div>

            {/* Learning goals */}
            <div>
                <label
                    htmlFor="learningGoals"
                    className="block text-sm font-medium text-gray-700"
                >
                    Learning goals
                </label>

                <textarea
                    id="learningGoals"
                    name="learningGoals"
                    rows={4}
                    disabled={pending}
                    placeholder="What should the student improve or achieve?"
                    className="
                mt-2 min-h-28 w-full resize-y rounded-lg
                border border-gray-200 bg-white p-3
                text-sm leading-6 text-gray-900
                outline-none transition
                placeholder:text-gray-400
                hover:border-gray-300
                focus:border-gray-900
                focus:ring-2 focus:ring-gray-900/10
                disabled:cursor-not-allowed
                disabled:bg-gray-50
            "
                />

                {state.errors?.learningGoals?.[0] && (
                    <FieldError>
                        {state.errors.learningGoals[0]}
                    </FieldError>
                )}
            </div>

            {/* Areas to improve */}
            <div>
                <label
                    htmlFor="weakAreas"
                    className="block text-sm font-medium text-gray-700"
                >
                    Areas to improve
                </label>

                <textarea
                    id="weakAreas"
                    name="weakAreas"
                    rows={4}
                    disabled={pending}
                    placeholder="Topics or skills that need additional attention."
                    className="
                mt-2 min-h-28 w-full resize-y rounded-lg
                border border-gray-200 bg-white p-3
                text-sm leading-6 text-gray-900
                outline-none transition
                placeholder:text-gray-400
                hover:border-gray-300
                focus:border-gray-900
                focus:ring-2 focus:ring-gray-900/10
                disabled:cursor-not-allowed
                disabled:bg-gray-50
            "
                />

                {state.errors?.weakAreas?.[0] && (
                    <FieldError>
                        {state.errors.weakAreas[0]}
                    </FieldError>
                )}
            </div>

            {/* Server error */}
            {state.message && !state.success && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <p className="text-sm leading-5">
                        {state.message}
                    </p>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                    type="submit"
                    disabled={pending}
                    className="
                flex h-10 items-center justify-center gap-2
                rounded-lg bg-gray-900 px-4
                text-sm font-medium text-white
                transition hover:bg-gray-800
                focus:outline-none focus:ring-2
                focus:ring-gray-900 focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
            "
                >
                    {pending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}

                    {pending
                        ? "Creating student..."
                        : "Create student"}
                </button>
            </div>
        </form>
    );
}

function FieldError({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{children}</span>
        </p>
    );
}