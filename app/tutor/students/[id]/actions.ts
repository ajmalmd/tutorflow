"use server";

import { revalidatePath } from "next/cache";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { scheduleSessionSchema } from "@/lib/validation/session";

export type ScheduleSessionState = {
  success: boolean;
  message?: string;
  errors?: {
    topic?: string[];
    starts_at?: string[];
    duration?: string[];
  };
};

export async function scheduleSession(
  studentId: string,
  _previousState: ScheduleSessionState,
  formData: FormData,
): Promise<ScheduleSessionState> {
  const currentUser = await requireTutor();

  const parsed = scheduleSessionSchema.safeParse({
    topic: formData.get("topic"),
    starts_at: formData.get("starts_at"),
    duration: formData.get("duration"),
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // -----------------------------------------------------
  // Verify that this student belongs to this tutor.
  // -----------------------------------------------------

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("tutor_id", currentUser.user.id)
    .maybeSingle();

  if (studentError) {
    return {
      success: false,
      message: "Unable to verify the student.",
    };
  }

  if (!student) {
    return {
      success: false,
      message: "Student not found.",
    };
  }

  // -----------------------------------------------------
  // Calculate end time on the server.
  // -----------------------------------------------------

  const startsAt = new Date(parsed.data.starts_at);

  const endsAt = new Date(
    startsAt.getTime() + parsed.data.duration * 60 * 1000,
  );

  if (endsAt <= startsAt) {
    return {
      success: false,
      message: "Session end time must be after its start time.",
    };
  }

  const startsAtIso = startsAt.toISOString();
  const endsAtIso = endsAt.toISOString();

  // -----------------------------------------------------
  // Friendly application-level overlap check.
  //
  // existing.starts_at < new.ends_at
  // AND
  // existing.ends_at > new.starts_at
  // -----------------------------------------------------

  const { data: conflictingSession, error: conflictError } = await supabase
    .from("sessions")
    .select("id")
    .eq("tutor_id", currentUser.user.id)
    .lt("starts_at", endsAtIso)
    .gt("ends_at", startsAtIso)
    .limit(1)
    .maybeSingle();

  if (conflictError) {
    return {
      success: false,
      message: "Unable to check your schedule.",
    };
  }

  if (conflictingSession) {
    return {
      success: false,
      message: "You already have another session during this time.",
    };
  }

  // -----------------------------------------------------
  // Insert.
  //
  // DB exclusion constraint is still the final authority
  // if two requests race each other.
  // -----------------------------------------------------

  const { error: insertError } = await supabase.from("sessions").insert({
    tutor_id: currentUser.user.id,
    student_id: studentId,
    topic: parsed.data.topic,
    starts_at: startsAtIso,
    ends_at: endsAtIso,
    status: "scheduled",
  });

  if (insertError) {
    // PostgreSQL exclusion constraint violation.
    if (insertError.code === "23P01") {
      return {
        success: false,
        message: "You already have another session during this time.",
      };
    }

    console.error("Schedule session error:", insertError);

    return {
      success: false,
      message: "Unable to schedule the session.",
    };
  }

  revalidatePath(`/tutor/students/${studentId}`);
  revalidatePath("/tutor");

  return {
    success: true,
    message: "Session scheduled successfully.",
  };
}
