"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function handleLogout() {
        if (isSigningOut) return;

        setIsSigningOut(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Sign out failed:", error);
            setIsSigningOut(false);
            return;
        }

        // Full navigation clears client component state and
        // ensures the next authenticated session starts cleanly.
        window.location.replace("/login");
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="
        inline-flex items-center justify-center gap-2
        rounded-lg border border-gray-200 bg-white px-4 py-2
        text-sm font-medium text-gray-700
        transition hover:bg-gray-50
        disabled:cursor-not-allowed disabled:opacity-60
      "
        >
            {isSigningOut ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing out...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4" />
                    Sign out
                </>
            )}
        </button>
    );
}