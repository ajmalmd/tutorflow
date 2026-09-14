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

    const value = useMemo(
        () => ({
            notes,
            setNotes,
            hasUsefulNotes:
                notes.trim().length >= 10,
        }),
        [notes],
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
            "useSessionNotes must be used inside SessionNotesProvider",
        );
    }

    return context;
}