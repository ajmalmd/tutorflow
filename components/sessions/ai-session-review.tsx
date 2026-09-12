import type { SessionDebrief } from "@/lib/ai/schemas/session-debrief";

type AISessionReviewProps = {
    review: SessionDebrief;
};

export function AISessionReview({
    review,
}: AISessionReviewProps) {
    return (
        <section className="rounded-xl border bg-white p-6">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    AI Session Review
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                    Session debrief
                </h2>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Summary
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {review.summary}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Homework
                </h3>

                <div className="mt-3 space-y-3">
                    {review.homework.map(
                        (item, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <p className="text-sm font-medium">
                                    {index + 1}.{" "}
                                    {item.task}
                                </p>

                                <p className="mt-2 text-sm text-gray-600">
                                    {
                                        item.instructions
                                    }
                                </p>
                            </div>
                        ),
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Next focus
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    {review.next_focus}
                </p>
            </div>
        </section>
    );
}