import { BookOpenText, ClipboardCheck, Target } from "lucide-react";

import type { SessionDebrief } from "@/lib/ai/schemas/session-debrief";

type AISessionReviewProps = { review: SessionDebrief };

export function AISessionReview({ review }: AISessionReviewProps) {
    return (
        <div className="space-y-7">
            {/* Summary */}
            <section>
                <div className="flex items-center gap-2">
                    <BookOpenText className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Summary
                    </h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {review.summary}
                </p>
            </section>

            {/* Homework */}
            <section>
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Homework
                    </h3>

                    {review.homework.length > 0 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                            {review.homework.length}
                        </span>
                    )}
                </div>

                {review.homework.length > 0 ? (
                    <div className="mt-3 space-y-2">
                        {review.homework.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                                        {index + 1}
                                    </span>

                                    <div>
                                        <p className="text-sm font-medium leading-6 text-gray-900">
                                            {item.task}
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            {item.instructions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-gray-500">
                        No homework assigned.
                    </p>
                )}
            </section>

            {/* Next focus */}
            <section>
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Next focus
                    </h3>
                </div>

                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                    <p className="text-sm leading-6 text-gray-600">
                        {review.next_focus}
                    </p>
                </div>
            </section>
        </div>
    );
}