"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    async function handleLogout() {
        if (isPending) return;

        setIsPending(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Unable to sign out:", error);
            setIsPending(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="
                inline-flex h-10 shrink-0 items-center
                justify-center gap-2 rounded-lg
                border border-gray-200 bg-white px-3.5
                text-sm font-medium text-gray-700
                shadow-sm transition
                hover:border-gray-300 hover:bg-gray-50
                focus:outline-none focus:ring-2
                focus:ring-gray-900/10
                disabled:cursor-not-allowed
                disabled:opacity-60
            "
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="h-4 w-4 text-gray-500" />
            )}

            <span className="hidden sm:inline">
                {isPending ? "Signing out..." : "Sign out"}
            </span>
        </button>
    );
}