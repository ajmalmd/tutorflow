"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { generateSessionPlanAction } from "@/app/tutor/sessions/[id]/ai-actions";

type GeneratePlanButtonProps = { sessionId: string };

export function GeneratePlanButton({ sessionId }: GeneratePlanButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleGenerate() {
        setError(null);

        startTransition(async () => {
            const result = await generateSessionPlanAction(sessionId);

            if (!result.success) {
                setError(result.error ?? "Unable to generate plan.");
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
                    ? "Generating plan..."
                    : "Generate session plan"}
            </button>

            {error && (
                <div
                    role="alert"
                    className="mt-3 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}