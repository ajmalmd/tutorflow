export default function StudentLoading() {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header */}
                <div className="mb-10 flex items-start gap-4">
                    <div className="hidden h-11 w-11 animate-pulse rounded-xl bg-gray-200 sm:block" />

                    <div>
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                        <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded bg-gray-200" />

                        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>

                {/* Section title */}
                <div className="mb-4 flex items-center gap-2">
                    <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                </div>

                {/* Session cards */}
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-3 flex gap-3">
                                        <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />

                                        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                                    </div>
                                </div>

                                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}