"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type SessionNotesContextValue = {
    notes: string;
    setNotes: (notes: string) => void;

    hasUsefulNotes: boolean;

    isSaving: boolean;
    setIsSaving: (saving: boolean) => void;

    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (unsaved: boolean) => void;
};

const SessionNotesContext =
    createContext<SessionNotesContextValue | null>(null);

type SessionNotesProviderProps = {
    initialNotes: string;
    children: ReactNode;
};

export function SessionNotesProvider({
    initialNotes,
    children,
}: SessionNotesProviderProps) {
    const [notes, setNotes] = useState(initialNotes);

    const [isSaving, setIsSaving] = useState(false);

    const [hasUnsavedChanges, setHasUnsavedChanges] =
        useState(false);

    const hasUsefulNotes =
        notes.trim().length >= 10;

    const value = useMemo(
        () => ({
            notes,
            setNotes,
            hasUsefulNotes,
            isSaving,
            setIsSaving,
            hasUnsavedChanges,
            setHasUnsavedChanges,
        }),
        [
            notes,
            hasUsefulNotes,
            isSaving,
            hasUnsavedChanges,
        ],
    );

    return (
        <SessionNotesContext.Provider value={value}>
            {children}
        </SessionNotesContext.Provider>
    );
}

export function useSessionNotes() {
    const context = useContext(SessionNotesContext);

    if (!context) {
        throw new Error(
            "useSessionNotes must be used within SessionNotesProvider",
        );
    }

    return context;
}