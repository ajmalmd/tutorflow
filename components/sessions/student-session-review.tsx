import type { SessionDebrief } from "@/lib/ai/schemas/session-debrief";

type StudentSessionReviewProps = {
    review: SessionDebrief;
};

export function StudentSessionReview({
    review,
}: StudentSessionReviewProps) {
    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-sm font-semibold">
                    What we covered
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {review.summary}
                </p>
            </section>

            <section>
                <h3 className="text-sm font-semibold">
                    Homework
                </h3>

                <div className="mt-3 space-y-3">
                    {review.homework.map(
                        (item, index) => (
                            <div
                                key={`${item.task}-${index}`}
                                className="rounded-lg border p-4"
                            >
                                <p className="text-sm font-medium">
                                    {index + 1}.{" "}
                                    {item.task}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    {
                                        item.instructions
                                    }
                                </p>
                            </div>
                        ),
                    )}
                </div>
            </section>

            <section>
                <h3 className="text-sm font-semibold">
                    Next focus
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    {review.next_focus}
                </p>
            </section>
        </div>
    );
}