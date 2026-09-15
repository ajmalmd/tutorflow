import {
    BookOpenText,
    CheckSquare,
    Target,
} from "lucide-react";

import type { SessionDebrief } from "@/lib/ai/schemas/session-debrief";

type StudentSessionReviewProps = { review: SessionDebrief };

export function StudentSessionReview({ review }: StudentSessionReviewProps) {
    return (
        <div className="space-y-7">
            {/* Summary */}
            <section>
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                        <BookOpenText className="h-3.5 w-3.5 text-gray-500" />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900">
                        What we covered
                    </h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                    {review.summary}
                </p>
            </section>

            {/* Homework */}
            <section>
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                        <CheckSquare className="h-3.5 w-3.5 text-gray-500" />
                    </div>

                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Homework
                        </h3>

                        {review.homework.length > 0 && (
                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                {review.homework.length}
                            </span>
                        )}
                    </div>
                </div>

                {review.homework.length > 0 ? (
                    <div className="mt-3 space-y-2">
                        {review.homework.map((item, index) => (
                            <div
                                key={`${item.task}-${index}`}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                        {index + 1}
                                    </div>

                                    <div className="min-w-0">
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
                        No homework assigned for this session.
                    </p>
                )}
            </section>

            {/* Next focus */}
            <section>
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                        <Target className="h-3.5 w-3.5 text-gray-500" />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900">
                        Next focus
                    </h3>
                </div>

                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm leading-6 text-gray-600">
                        {review.next_focus}
                    </p>
                </div>
            </section>
        </div>
    );
}