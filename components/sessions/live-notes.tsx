"use client";

import { useEffect, useRef, useState } from "react";

import { saveLiveNotes } from "@/app/tutor/sessions/[id]/actions";
import { useSessionNotes } from "@/components/sessions/session-notes-context";

type LiveNotesProps = {
    sessionId: string;
    editable: boolean;
};

export function LiveNotes({
    sessionId,
    editable,
}: LiveNotesProps) {
    const {
        notes,
        setNotes,
    } = useSessionNotes();

    const [saveStatus, setSaveStatus] =
        useState<
            "idle" |
            "saving" |
            "saved" |
            "error"
        >("idle");

    const initialRender = useRef(true);

    useEffect(() => {
        if (!editable) {
            return;
        }

        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        setSaveStatus("saving");

        const timeout = window.setTimeout(
            async () => {
                const result =
                    await saveLiveNotes(
                        sessionId,
                        notes,
                    );

                if (result.success) {
                    setSaveStatus("saved");
                } else {
                    setSaveStatus("error");
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
    ]);

    return (
        <div>
            <textarea
                value={notes}
                onChange={(event) =>
                    setNotes(
                        event.target.value,
                    )
                }
                disabled={!editable}
                rows={10}
                className="w-full resize-y rounded-lg border p-3 text-sm disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="Write session notes..."
            />

            {editable && (
                <p className="mt-2 text-xs text-gray-500">
                    {saveStatus === "saving" &&
                        "Saving..."}

                    {saveStatus === "saved" &&
                        "Saved"}

                    {saveStatus === "error" &&
                        "Unable to save notes."}
                </p>
            )}
        </div>
    );
}