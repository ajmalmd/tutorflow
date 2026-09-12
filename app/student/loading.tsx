export default function StudentLoading() {
    return (
        <main className="mx-auto max-w-5xl p-8">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

            <div className="mt-8 space-y-4">
                {[1, 2, 3].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-xl border bg-gray-50"
                        />
                    ),
                )}
            </div>
        </main>
    );
}