"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { saveLiveNotes } from "@/app/tutor/sessions/[id]/actions";

type SaveStatus =
    | "idle"
    | "saving"
    | "saved"
    | "error";

type LiveNotesProps = {
    sessionId: string;
    initialNotes: string;
    editable: boolean;
};

const AUTOSAVE_DELAY = 800;

export function LiveNotes({
    sessionId,
    initialNotes,
    editable,
}: LiveNotesProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [saveStatus, setSaveStatus] =
        useState<SaveStatus>("idle");

    const lastSavedNotesRef = useRef(initialNotes);
    const notesRef = useRef(initialNotes);
    const savingRef = useRef(false);
    const hasPendingChangesRef = useRef(false);

    useEffect(() => {
        setNotes(initialNotes);

        notesRef.current = initialNotes;
        lastSavedNotesRef.current = initialNotes;

        savingRef.current = false;
        hasPendingChangesRef.current = false;

        setSaveStatus("idle");
    }, [initialNotes, sessionId]);

    useEffect(() => {
        notesRef.current = notes;
    }, [notes]);

    useEffect(() => {
        if (!editable) {
            return;
        }

        if (notes === lastSavedNotesRef.current) {
            return;
        }

        const timeout = window.setTimeout(async () => {
            if (savingRef.current) {
                hasPendingChangesRef.current = true;
                return;
            }

            await persistNotes();
        }, AUTOSAVE_DELAY);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [notes, editable]);

    async function persistNotes() {
        if (!editable) {
            return;
        }

        const valueToSave = notesRef.current;

        if (valueToSave === lastSavedNotesRef.current) {
            return;
        }

        savingRef.current = true;
        hasPendingChangesRef.current = false;

        setSaveStatus("saving");

        const result = await saveLiveNotes(
            sessionId,
            valueToSave,
        );

        savingRef.current = false;

        if (!result.success) {
            setSaveStatus("error");
            return;
        }

        lastSavedNotesRef.current = valueToSave;

        if (
            hasPendingChangesRef.current ||
            notesRef.current !== valueToSave
        ) {
            await persistNotes();
            return;
        }

        setSaveStatus("saved");
    }

    if (!editable) {
        return (
            <div>
                {notes ? (
                    <p className="whitespace-pre-wrap text-sm leading-6">
                        {notes}
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">
                        No notes recorded.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <textarea
                value={notes}
                onChange={(event) => {
                    const nextNotes = event.target.value;

                    notesRef.current = nextNotes;
                    setNotes(nextNotes);

                    setSaveStatus("idle");
                }}
                onBlur={() => {
                    void persistNotes();
                }}
                rows={14}
                placeholder="Add notes during the session..."
                className="w-full resize-y rounded-lg border px-3 py-3 text-sm leading-6 outline-none focus:border-gray-400"
            />

            <div className="mt-2 min-h-5 text-xs">
                {saveStatus === "saving" && (
                    <span className="text-gray-500">
                        Saving...
                    </span>
                )}

                {saveStatus === "saved" && (
                    <span className="text-green-700">
                        Saved
                    </span>
                )}

                {saveStatus === "error" && (
                    <span className="text-red-600">
                        Failed to save
                    </span>
                )}
            </div>
        </div>
    );
}