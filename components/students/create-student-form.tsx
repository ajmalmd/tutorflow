"use client";

import { useActionState } from "react";

import {
    createStudent,
    type CreateStudentState,
} from "@/app/tutor/students/actions";

const initialState: CreateStudentState = {
    success: false,
};

export function CreateStudentForm() {
    const [
        state,
        action,
        pending,
    ] = useActionState(
        createStudent,
        initialState,
    );

    return (
        <form
            action={action}
            className="space-y-6"
        >
            <div>
                <label
                    htmlFor="name"
                    className="text-sm font-medium"
                >
                    Student name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={pending}
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                />

                {state.errors?.name?.[0] && (
                    <p className="mt-1 text-sm text-red-600">
                        {
                            state.errors
                                .name[0]
                        }
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="text-sm font-medium"
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
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                />

                {state.errors?.email?.[0] && (
                    <p className="mt-1 text-sm text-red-600">
                        {
                            state.errors
                                .email[0]
                        }
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="text-sm font-medium"
                >
                    Temporary password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    disabled={pending}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                />

                <p className="mt-1 text-xs text-gray-500">
                    Used only when a new
                    student account needs to
                    be created.
                </p>

                {state.errors
                    ?.password?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                            {
                                state.errors
                                    .password[0]
                            }
                        </p>
                    )}
            </div>

            <div>
                <label
                    htmlFor="subject"
                    className="text-sm font-medium"
                >
                    Subject
                </label>

                <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    disabled={pending}
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                />

                {state.errors
                    ?.subject?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                            {
                                state.errors
                                    .subject[0]
                            }
                        </p>
                    )}
            </div>

            <div>
                <label
                    htmlFor="currentLevel"
                    className="text-sm font-medium"
                >
                    Current level
                </label>

                <input
                    id="currentLevel"
                    name="currentLevel"
                    type="text"
                    required
                    disabled={pending}
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                />

                {state.errors
                    ?.currentLevel?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                            {
                                state.errors
                                    .currentLevel[0]
                            }
                        </p>
                    )}
            </div>

            <div>
                <label
                    htmlFor="learningGoals"
                    className="text-sm font-medium"
                >
                    Learning goals
                </label>

                <textarea
                    id="learningGoals"
                    name="learningGoals"
                    rows={4}
                    disabled={pending}
                    className="mt-2 w-full resize-y rounded-lg border px-3 py-2"
                    placeholder="What should the student improve or achieve?"
                />

                {state.errors
                    ?.learningGoals?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                            {
                                state.errors
                                    .learningGoals[0]
                            }
                        </p>
                    )}
            </div>

            <div>
                <label
                    htmlFor="weakAreas"
                    className="text-sm font-medium"
                >
                    Weak areas
                </label>

                <textarea
                    id="weakAreas"
                    name="weakAreas"
                    rows={4}
                    disabled={pending}
                    className="mt-2 w-full resize-y rounded-lg border px-3 py-2"
                    placeholder="Topics or skills the student currently struggles with."
                />

                {state.errors
                    ?.weakAreas?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                            {
                                state.errors
                                    .weakAreas[0]
                            }
                        </p>
                    )}
            </div>

            {state.message &&
                !state.success && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {state.message}
                    </p>
                )}

            <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending
                    ? "Creating student..."
                    : "Create student"}
            </button>
        </form>
    );
}