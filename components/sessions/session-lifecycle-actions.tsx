"use client";

import { useActionState } from "react";

import { AlertCircle, CheckCircle2, Loader2, Play } from "lucide-react";

import { completeSession, startSession, type SessionLifecycleState } from "@/app/tutor/sessions/[id]/actions";

import { useSessionNotes } from "@/components/sessions/session-notes-context";

type SessionStatus =
    | "scheduled"
    | "in_progress"
    | "completed"
    | "ai_reviewed";

type SessionLifecycleActionsProps = {
    sessionId: string;
    status: SessionStatus;
    canStart: boolean;
};

const initialState: SessionLifecycleState = { success: false };

export function SessionLifecycleActions({
    sessionId,
    status,
    canStart,
}: SessionLifecycleActionsProps) {
    const {
        hasUsefulNotes,
        isSaving,
        hasUnsavedChanges,
    } = useSessionNotes();

    const canComplete =
        hasUsefulNotes &&
        !isSaving &&
        !hasUnsavedChanges;

    const startSessionForCurrentSession =
        startSession.bind(null, sessionId);

    const completeSessionForCurrentSession =
        completeSession.bind(null, sessionId);

    const [
        startState, startAction, startPending
    ] = useActionState(
        startSessionForCurrentSession, initialState
    );

    const [
        completeState, completeAction, completePending
    ] = useActionState(
        completeSessionForCurrentSession, initialState
    );

    if (status === "scheduled") {
        return (
            <div>
                <form action={startAction}>
                    <button
                        type="submit"
                        disabled={startPending || !canStart}
                        className="
                            flex h-10 w-full items-center justify-center gap-2
                            rounded-lg bg-gray-900 px-4
                            text-sm font-medium text-white
                            transition
                            hover:bg-gray-800
                            focus:outline-none
                            focus:ring-2 focus:ring-gray-900
                            focus:ring-offset-2
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {startPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}

                        {startPending
                            ? "Starting..."
                            : "Start session"}
                    </button>
                </form>

                {!canStart && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <p className="text-xs leading-5 text-gray-500">
                            Available at the scheduled start time.
                        </p>
                    </div>
                )}

                {startState.message && !startState.success && (
                    <div
                        role="alert"
                        className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-700"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <p className="text-sm leading-5">
                            {startState.message}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (status === "in_progress") {
        return (
            <div>
                <form action={completeAction}>
                    <button
                        type="submit"
                        disabled={completePending || !canComplete}
                        className="
                            flex h-10 w-full items-center justify-center gap-2
                            rounded-lg bg-gray-900 px-4
                            text-sm font-medium text-white
                            transition
                            hover:bg-gray-800
                            focus:outline-none
                            focus:ring-2 focus:ring-gray-900
                            focus:ring-offset-2
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {completePending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}

                        {completePending
                            ? "Completing..."
                            : "Complete session"}
                    </button>
                </form>

                {!hasUsefulNotes && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                        <p className="text-xs leading-5 text-amber-700">
                            Add meaningful session notes before completing
                            the session.
                        </p>
                    </div>
                )}

                {hasUsefulNotes &&
                    (hasUnsavedChanges || isSaving) && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-gray-400" />

                            <p className="text-xs leading-5 text-gray-500">
                                Waiting for session notes to save before
                                completing.
                            </p>
                        </div>
                    )}

                {completeState.message &&
                    !completeState.success && (
                        <div
                            role="alert"
                            className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-700"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <p className="text-sm leading-5">
                                {completeState.message}
                            </p>
                        </div>
                    )}
            </div>
        );
    }

    return null;
}