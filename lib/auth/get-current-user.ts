import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type UserRole = "tutor" | "student";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    user,
    profile,
  };
}

export async function requireUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function requireTutor() {
  const currentUser = await requireUser();

  if (currentUser.profile.role !== "tutor") {
    redirect("/student");
  }

  return currentUser;
}

export async function requireStudent() {
  const currentUser = await requireUser();

  if (currentUser.profile.role !== "student") {
    redirect("/tutor");
  }

  return currentUser;
}
