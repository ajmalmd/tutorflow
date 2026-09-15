"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function StudentError({ reset }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                </div>

                <h1 className="mt-5 text-xl font-semibold tracking-tight text-gray-900">
                    Unable to load your sessions
                </h1>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Something went wrong while loading your tutoring
                    information. Please try again.
                </p>

                <button
                    type="button"
                    onClick={reset}
                    className="
                        mx-auto mt-6 flex h-10 items-center justify-center
                        gap-2 rounded-lg bg-gray-900 px-4
                        text-sm font-medium text-white
                        transition hover:bg-gray-800
                        focus:outline-none focus:ring-2
                        focus:ring-gray-900 focus:ring-offset-2
                    "
                >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </button>
            </div>
        </main>
    );
}