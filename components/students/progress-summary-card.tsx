"use client";

import { useState, useTransition } from "react";
import {
    Brain,
    CheckCircle2,
    CircleAlert,
    Loader2,
    RefreshCw,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react";

import { generateProgressSummaryAction } from "@/app/tutor/students/[id]/ai-actions";

import type { ProgressSummary } from "@/lib/ai/schemas/progress-summary";

type ProgressSummaryCardProps = {
    studentId: string;
    hasReviewedSessions: boolean;
};

export function ProgressSummaryCard({
    studentId,
    hasReviewedSessions,
}: ProgressSummaryCardProps) {
    const [summary, setSummary] = useState<ProgressSummary | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [isPending, startTransition] = useTransition();

    function handleGenerate() {
        setError(null);

        startTransition(async () => {
            const result = await generateProgressSummaryAction(studentId);

            if (!result.success) {
                setError(result.error);
                return;
            }

            setSummary(result.summary);
        });
    }

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Brain className="h-4 w-4 text-gray-600" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            AI progress summary
                        </h2>

                        <p className="mt-0.5 text-sm leading-5 text-gray-500">
                            Review progress and recurring focus areas
                            across completed sessions.
                        </p>
                    </div>
                </div>

                {hasReviewedSessions && (
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isPending}
                        className="
                            inline-flex shrink-0 items-center
                            justify-center gap-2 rounded-lg
                            bg-gray-900 px-3.5 py-2
                            text-sm font-medium text-white
                            transition hover:bg-gray-800
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : summary ? (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                Regenerate
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate summary
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* No reviewed history */}
            {!hasReviewedSessions && (
                <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-5 py-6 text-center">
                    <Sparkles className="mx-auto h-5 w-5 text-gray-300" />

                    <p className="mt-2 text-sm font-medium text-gray-600">
                        No reviewed sessions yet
                    </p>

                    <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-gray-400">
                        Complete and review a session to generate a
                        progress summary for this student.
                    </p>
                </div>
            )}

            {/* Initial state */}
            {hasReviewedSessions &&
                !summary &&
                !error &&
                !isPending && (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/50 px-5 py-5">
                        <p className="text-sm leading-6 text-gray-500">
                            Generate a summary from this student's
                            reviewed session history to identify
                            supported progress, recurring challenges,
                            and recommended areas of focus.
                        </p>
                    </div>
                )}

            {/* Generating */}
            {isPending && !summary && (
                <div className="mt-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-5 py-5">
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />

                    <p className="text-sm text-gray-500">
                        Reviewing session history...
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                    <p className="text-sm leading-5 text-red-700">
                        {error}
                    </p>
                </div>
            )}

            {/* Generated result */}
            {summary && (
                <div className="mt-6 space-y-6">
                    {/* Overall progress */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Overall progress
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                            {summary.overall_progress}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Improvements */}
                        <SummaryList
                            icon={
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                            }
                            title="Improvements"
                            items={summary.improvements}
                            emptyMessage="No supported improvement trend yet."
                        />

                        {/* Challenges */}
                        <SummaryList
                            icon={
                                <CircleAlert className="h-4 w-4 text-gray-500" />
                            }
                            title="Recurring challenges"
                            items={summary.recurring_challenges}
                            emptyMessage="No recurring challenges identified."
                        />
                    </div>

                    {/* Recommended focus */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />

                            <h3 className="text-sm font-semibold text-gray-900">
                                Recommended focus
                            </h3>
                        </div>

                        <ul className="mt-3 space-y-2">
                            {summary.recommended_focus.map(
                                (item, index) => (
                                    <li
                                        key={`${item}-${index}`}
                                        className="flex items-start gap-2 text-sm leading-5 text-gray-600"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                        <span>{item}</span>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>

                    <p className="text-xs leading-5 text-gray-400">
                        Generated from the student's reviewed session
                        history. Regenerate after new sessions are
                        reviewed for an updated summary.
                    </p>
                </div>
            )}
        </section>
    );
}

function SummaryList({
    icon,
    title,
    items,
    emptyMessage,
}: {
    icon: React.ReactNode;
    title: string;
    items: string[];
    emptyMessage: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-2">
                {icon}

                <h3 className="text-sm font-semibold text-gray-900">
                    {title}
                </h3>
            </div>

            {items.length > 0 ? (
                <ul className="mt-3 space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={`${item}-${index}`}
                            className="flex items-start gap-2 text-sm leading-5 text-gray-600"
                        >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />

                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 text-sm leading-5 text-gray-400">
                    {emptyMessage}
                </p>
            )}
        </div>
    );
}