"use server";

import { revalidatePath } from "next/cache";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

export type SessionLifecycleState = {
  success: boolean;
  message?: string;
};

export async function startSession(
  sessionId: string,
  _previousState: SessionLifecycleState,
  _formData: FormData,
): Promise<SessionLifecycleState> {
  await requireTutor();

  const supabase = await createClient();

  const { error } = await supabase.rpc("start_session", {
    p_session_id: sessionId,
  });

  if (error) {
    console.error("Start session error:", error);

    return {
      success: false,
      message:
        "This session cannot be started. It may have already changed state.",
    };
  }

  revalidatePath(`/tutor/sessions/${sessionId}`);
  revalidatePath("/tutor");

  return {
    success: true,
    message: "Session started.",
  };
}

export async function completeSession(
  sessionId: string,
  _previousState: SessionLifecycleState,
  _formData: FormData,
): Promise<SessionLifecycleState> {
  await requireTutor();

  const supabase = await createClient();

  const { error } = await supabase.rpc("complete_session", {
    p_session_id: sessionId,
  });

  if (error) {
    console.error("Complete session error:", error);

    return {
      success: false,
      message:
        "This session cannot be completed. It may have already changed state.",
    };
  }

  revalidatePath(`/tutor/sessions/${sessionId}`);
  revalidatePath("/tutor");

  return {
    success: true,
    message: "Session completed.",
  };
}

export type SaveLiveNotesState = {
  success: boolean;
  message?: string;
};

export async function saveLiveNotes(
  sessionId: string,
  liveNotes: string,
): Promise<SaveLiveNotesState> {
  await requireTutor();

  const supabase = await createClient();

  const { error } = await supabase.rpc("save_session_live_notes", {
    p_session_id: sessionId,
    p_live_notes: liveNotes,
  });

  if (error) {
    console.error("Save live notes error:", error);

    return {
      success: false,
      message: "Unable to save notes.",
    };
  }

  return {
    success: true,
  };
}
