"use client";

export default function StudentError({
    reset,
}: {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}) {
    return (
        <main className="mx-auto max-w-xl p-8">
            <div className="rounded-xl border bg-white p-6">
                <h1 className="text-lg font-semibold">
                    Unable to load your sessions
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Something went wrong
                    while loading your
                    tutoring information.
                </p>

                <button
                    type="button"
                    onClick={reset}
                    className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                    Try again
                </button>
            </div>
        </main>
    );
}