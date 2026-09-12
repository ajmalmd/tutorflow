"use client";

import { useState } from "react";

import { StudentSessionReview } from "@/components/sessions/student-session-review";
import type { SessionDebrief } from "@/lib/ai/schemas/session-debrief";

type StudentReviewedSessionProps = {
    topic: string;
    startsAt: string;
    durationMinutes: number;
    review: SessionDebrief;
};

export function StudentReviewedSession({
    topic,
    startsAt,
    durationMinutes,
    review,
}: StudentReviewedSessionProps) {
    const [open, setOpen] =
        useState(false);

    const date =
        new Date(startsAt);

    return (
        <article className="rounded-xl border bg-white">
            <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold">
                                {topic}
                            </h2>

                            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                Review ready
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            {date.toLocaleString()}
                            {" · "}
                            {durationMinutes} minutes
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setOpen(
                                (current) =>
                                    !current,
                            )
                        }
                        className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        {open
                            ? "Hide review"
                            : "View review"}
                    </button>
                </div>
            </div>

            {open && (
                <div className="border-t p-5">
                    <StudentSessionReview
                        review={review}
                    />
                </div>
            )}
        </article>
    );
}