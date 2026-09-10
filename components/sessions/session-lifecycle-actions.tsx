"use client";

import { useActionState } from "react";

import {
    completeSession,
    startSession,
    type SessionLifecycleState,
} from "@/app/tutor/sessions/[id]/actions";

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

const initialState: SessionLifecycleState = {
    success: false,
};

export function SessionLifecycleActions({
    sessionId,
    status,
    canStart
}: SessionLifecycleActionsProps) {
    const startSessionForCurrentSession =
        startSession.bind(null, sessionId);

    const completeSessionForCurrentSession =
        completeSession.bind(null, sessionId);

    const [
        startState,
        startAction,
        startPending,
    ] = useActionState(
        startSessionForCurrentSession,
        initialState,
    );

    const [
        completeState,
        completeAction,
        completePending,
    ] = useActionState(
        completeSessionForCurrentSession,
        initialState,
    );

    if (status === "scheduled") {
        return (
            <div>
                <form action={startAction}>
                    <button
                        type="submit"
                        disabled={startPending || !canStart}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {startPending
                            ? "Starting..."
                            : "Start session"}
                    </button>
                </form>
                {!canStart && (
                    <p className="mt-2 text-sm text-gray-500">
                        Available at the scheduled start time.
                    </p>
                )}

                {startState.message && !startState.success && (
                    <p className="mt-2 text-sm text-red-600">
                        {startState.message}
                    </p>
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
                        disabled={completePending}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {completePending
                            ? "Completing..."
                            : "Complete session"}
                    </button>
                </form>

                {completeState.message &&
                    !completeState.success && (
                        <p className="mt-2 text-sm text-red-600">
                            {completeState.message}
                        </p>
                    )}
            </div>
        );
    }

    return null;
}