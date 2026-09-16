"use server";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";

import { generateProgressSummary } from "@/lib/ai/generate-progress-summary";
import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";

import type { ProgressSummary } from "@/lib/ai/schemas/progress-summary";
import type { ProgressSummaryHistoryItem } from "@/lib/ai/types";

export type GenerateProgressSummaryResult =
  | {
      success: true;
      summary: ProgressSummary;
    }
  | {
      success: false;
      error: string;
    };

export async function generateProgressSummaryAction(
  studentId: string,
): Promise<GenerateProgressSummaryResult> {
  try {
    const currentUser = await requireTutor();

    const supabase = await createClient();

    // ------------------------------------------------
    // Student + explicit tutor ownership
    // ------------------------------------------------

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select(
        `
          id,
          subject,
          current_level,
          learning_goals,
          weak_areas
        `,
      )
      .eq("id", studentId)
      .eq("tutor_id", currentUser.user.id)
      .maybeSingle();

    if (studentError) {
      throw new Error(studentError.message);
    }

    if (!student) {
      return {
        success: false,
        error: "Student not found.",
      };
    }

    // ------------------------------------------------
    // Fetch the most recent 20 reviewed sessions.
    //
    // We fetch newest first so LIMIT gives us the
    // latest history. We'll restore chronological
    // order before sending it to AI.
    // ------------------------------------------------

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select(
        `
          id,
          topic,
          reviewed_at
        `,
      )
      .eq("student_id", student.id)
      .eq("tutor_id", currentUser.user.id)
      .eq("status", "ai_reviewed")
      .order("reviewed_at", {
        ascending: false,
      })
      .limit(20);

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    if (!sessions.length) {
      return {
        success: false,
        error: "No reviewed sessions are available for this student yet.",
      };
    }

    // ------------------------------------------------
    // Fetch every debrief in ONE query.
    //
    // Avoid:
    //   1 query per reviewed session
    //
    // Instead:
    //   1 sessions query
    //   1 debriefs query
    // ------------------------------------------------

    const sessionIds = sessions.map((session) => session.id);

    const { data: storedDebriefs, error: debriefError } = await supabase
      .from("session_debriefs")
      .select(
        `
          session_id,
          summary,
          homework,
          next_focus
        `,
      )
      .in("session_id", sessionIds);

    if (debriefError) {
      throw new Error(debriefError.message);
    }

    // ------------------------------------------------
    // Index debriefs by session ID for O(1) lookup.
    // ------------------------------------------------

    const debriefBySessionId = new Map(
      storedDebriefs.map((debrief) => [debrief.session_id, debrief]),
    );

    // ------------------------------------------------
    // Restore chronological order:
    //
    // oldest → newest
    //
    // This makes trends easier for the AI to interpret.
    // ------------------------------------------------

    const chronologicalSessions = [...sessions].reverse();

    // ------------------------------------------------
    // Validate stored JSON before giving it back to AI.
    //
    // Never assume JSON/JSONB stored in the database
    // still matches our application schema.
    // ------------------------------------------------

    const reviewedSessions: ProgressSummaryHistoryItem[] = [];

    for (const session of chronologicalSessions) {
      const storedDebrief = debriefBySessionId.get(session.id);

      if (!storedDebrief) {
        console.error(`Missing debrief for reviewed session ${session.id}`);

        continue;
      }

      const parsedDebrief = SessionDebriefSchema.safeParse({
        summary: storedDebrief.summary,
        homework: storedDebrief.homework,
        next_focus: storedDebrief.next_focus,
      });

      if (!parsedDebrief.success) {
        console.error(
          `Invalid stored debrief for session ${session.id}:`,
          parsedDebrief.error,
        );

        continue;
      }

      reviewedSessions.push({
        topic: session.topic,

        reviewedAt: session.reviewed_at ?? "Review date unavailable",

        summary: parsedDebrief.data.summary,

        homework: parsedDebrief.data.homework,

        nextFocus: parsedDebrief.data.next_focus,
      });
    }

    // ------------------------------------------------
    // All reviewed sessions should normally have valid
    // debriefs because the review RPC creates both
    // atomically.
    //
    // Still defend against corrupted/legacy data.
    // ------------------------------------------------

    if (!reviewedSessions.length) {
      return {
        success: false,
        error:
          "No valid reviewed session history is available for this student.",
      };
    }

    // ------------------------------------------------
    // Generate progress summary.
    //
    // Intentionally NOT persisted. It represents the
    // student's current reviewed-session history and
    // can be regenerated as that history changes.
    // ------------------------------------------------

    const generated = await generateProgressSummary({
      subject: student.subject,

      currentLevel: student.current_level,

      learningGoals: student.learning_goals,

      weakAreas: student.weak_areas,

      reviewedSessions,
    });

    return {
      success: true,
      summary: generated.summary,
    };
  } catch (error) {
    console.error("Progress summary generation failed:", error);

    return {
      success: false,
      error: "Unable to generate the progress summary. Please try again.",
    };
  }
}
