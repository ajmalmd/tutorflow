"use client";

import { useEffect, useRef, useState } from "react";

import { AlertCircle, Check, Loader2 } from "lucide-react";

import { saveLiveNotes } from "@/app/tutor/sessions/[id]/actions";
import { useSessionNotes } from "@/components/sessions/session-notes-context";

type LiveNotesProps = {
    sessionId: string;
    editable: boolean;
};

export function LiveNotes({ sessionId, editable }: LiveNotesProps) {

    const { notes, setNotes, setIsSaving, setHasUnsavedChanges } = useSessionNotes();

    const [saveStatus, setSaveStatus] =
        useState<"idle" | "saving" | "saved" | "error">("idle");

    const initialRender = useRef(true);

    useEffect(() => {
        if (!editable) {
            return;
        }

        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        setHasUnsavedChanges(true);

        const timeout = window.setTimeout(
            async () => {
                setIsSaving(true);
                setSaveStatus("saving");

                try {
                    const result = await saveLiveNotes(
                        sessionId,
                        notes,
                    );

                    if (result.success) {
                        setHasUnsavedChanges(false);
                        setSaveStatus("saved");
                    } else {
                        setSaveStatus("error");
                    }
                } catch (error) {
                    console.error(
                        "Unable to save session notes:",
                        error,
                    );

                    setSaveStatus("error");
                } finally {
                    setIsSaving(false);
                }
            },
            700,
        );

        return () => {
            window.clearTimeout(timeout);
        };
    }, [
        editable,
        notes,
        sessionId,
        setHasUnsavedChanges,
        setIsSaving,
    ]);

    return (
        <div>
            <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={!editable}
                rows={10}
                placeholder={
                    editable
                        ? "Write observations, progress, challenges, and important points from the session..."
                        : "No session notes yet."
                }
                className="
                    min-h-[220px] w-full resize-y rounded-lg
                    border border-gray-200 bg-white p-4
                    text-sm leading-6 text-gray-800
                    outline-none transition
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    disabled:cursor-default
                    disabled:bg-gray-50
                    disabled:text-gray-600
                "
            />

            {editable && (
                <div className="mt-2 flex min-h-5 items-center justify-end text-xs">
                    {saveStatus === "saving" && (
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                        </span>
                    )}

                    {saveStatus === "saved" && (
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <Check className="h-3.5 w-3.5" />
                            Saved
                        </span>
                    )}

                    {saveStatus === "error" && (
                        <span className="flex items-center gap-1.5 text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Unable to save notes
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}