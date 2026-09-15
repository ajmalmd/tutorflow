"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Loader2, Sparkles } from "lucide-react";

import { generateSessionReviewAction } from "@/app/tutor/sessions/[id]/ai-actions";

type GenerateReviewButtonProps = { sessionId: string };

export function GenerateReviewButton({ sessionId }: GenerateReviewButtonProps) {
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const [error, setError] = useState<string | null>(null);

    function handleGenerate() {
        setError(null);

        startTransition(async () => {
            const result =
                await generateSessionReviewAction(sessionId);

            if (!result.success) {
                setError(result.error ?? "Unable to generate review.");
                return;
            }

            router.refresh();
        });
    }

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleGenerate}
            className="
                flex h-10 w-full items-center justify-center gap-2
                rounded-lg bg-gray-900 px-4
                text-sm font-medium text-white
                transition hover:bg-gray-800
                focus:outline-none focus:ring-2
                focus:ring-gray-900 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60
            "
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="h-4 w-4" />
            )}

            {isPending
                ? "Generating review..."
                : "Generate AI review"}
        </button>
    );
}