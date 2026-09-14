import { createClient } from "@/lib/supabase/server";

export async function getStudentSessions() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_my_sessions");

  if (error) {
    console.error("Failed to load student sessions:", error);

    throw new Error("Unable to load your sessions.");
  }

  return data ?? [];
}

export async function getStudentSession(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_my_sessions")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load student session:", error);

    throw new Error("Unable to load this session.");
  }

  return data;
}

export async function getStudentDebriefs() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_my_session_debriefs");

  if (error) {
    console.error("Failed to load student debriefs:", error);

    throw new Error("Unable to load session reviews.");
  }

  return data ?? [];
}

export async function getStudentSessionDebrief(sessionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_my_session_debriefs")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load student debrief:", error);

    throw new Error("Unable to load this session review.");
  }

  return data;
}
