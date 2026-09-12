"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { generateSessionReviewAction } from "@/app/tutor/sessions/[id]/ai-actions";

type GenerateReviewButtonProps = {
    sessionId: string;
};

export function GenerateReviewButton({
    sessionId,
}: GenerateReviewButtonProps) {
    const router = useRouter();

    const [
        isPending,
        startTransition,
    ] = useTransition();

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    function handleGenerate() {
        setError(null);

        startTransition(async () => {
            const result =
                await generateSessionReviewAction(
                    sessionId,
                );

            if (!result.success) {
                setError(
                    result.error ??
                    "Unable to generate review.",
                );

                return;
            }

            router.refresh();
        });
    }

    return (
        <div>
            <button
                type="button"
                disabled={isPending}
                onClick={handleGenerate}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending
                    ? "Generating review..."
                    : "Generate AI review"}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}