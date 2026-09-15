"use client";

import { useState } from "react";
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
} from "lucide-react";

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
    const [open, setOpen] = useState(false);

    const date = new Date(startsAt);

    return (
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />

                            <h3 className="font-semibold text-gray-900">
                                {topic}
                            </h3>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                <CheckCircle2 className="h-3 w-3" />
                                Review ready
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />

                                {date.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />

                                {date.toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}

                                {" · "}
                                {durationMinutes} min
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        aria-expanded={open}
                        className="
                            flex h-9 w-fit shrink-0 items-center justify-center
                            gap-2 rounded-lg border border-gray-200
                            bg-white px-3 text-sm font-medium text-gray-700
                            transition
                            hover:border-gray-300 hover:bg-gray-50
                            focus:outline-none focus:ring-2
                            focus:ring-gray-900/10
                        "
                    >
                        {open ? "Hide review" : "View review"}

                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                </div>
            </div>

            {open && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                    <StudentSessionReview review={review} />
                </div>
            )}
        </article>
    );
}