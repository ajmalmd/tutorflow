"use server";

import { revalidatePath } from "next/cache";

import { requireTutor } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { generateSessionPlan } from "@/lib/ai/generate-session-plan";
import { SessionPlanSchema } from "@/lib/ai/schemas/session-plan";
import { generateSessionDebrief } from "@/lib/ai/generate-session-debrief";

export type GenerateSessionPlanResult = {
  success: boolean;
  error?: string;
};

export async function generateSessionPlanAction(
  sessionId: string,
): Promise<GenerateSessionPlanResult> {
  try {
    const currentUser = await requireTutor();

    const supabase = await createClient();

    // ---------------------------------------------
    // Load session + explicit ownership check
    // ---------------------------------------------

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(
        `
                id,
                tutor_id,
                student_id,
                topic,
                starts_at,
                ends_at,
                status
            `,
      )
      .eq("id", sessionId)
      .eq("tutor_id", currentUser.user.id)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return {
        success: false,
        error: "Session not found.",
      };
    }

    if (session.status !== "scheduled") {
      return {
        success: false,
        error: "Session plans can only be generated for scheduled sessions.",
      };
    }

    // ---------------------------------------------
    // Avoid wasting an AI request if it already
    // exists.
    // ---------------------------------------------

    const { data: existingPlan, error: existingPlanError } = await supabase
      .from("session_plans")
      .select("id")
      .eq("session_id", session.id)
      .maybeSingle();

    if (existingPlanError) {
      throw new Error(existingPlanError.message);
    }

    if (existingPlan) {
      return {
        success: false,
        error: "A session plan already exists.",
      };
    }

    // ---------------------------------------------
    // Student learning context
    // ---------------------------------------------

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
      .eq("id", session.student_id)
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

    const startsAt = new Date(session.starts_at);

    const endsAt = new Date(session.ends_at);

    const durationMinutes = Math.round(
      (endsAt.getTime() - startsAt.getTime()) / 60_000,
    );

    // ---------------------------------------------
    // AI happens BEFORE DB mutation.
    // ---------------------------------------------

    const generated = await generateSessionPlan({
      subject: student.subject,

      currentLevel: student.current_level,

      learningGoals: student.learning_goals,

      weakAreas: student.weak_areas,

      topic: session.topic,

      durationMinutes,
    });

    // ---------------------------------------------
    // Narrow database mutation
    // ---------------------------------------------

    const { error: saveError } = await supabase.rpc("save_session_plan", {
      p_session_id: session.id,

      p_objectives: generated.plan.objectives,

      p_lesson_outline: generated.plan.lesson_outline,

      p_practice_questions: generated.plan.practice_questions,

      p_model: generated.model,
    });

    if (saveError) {
      console.error("Failed to save session plan:", saveError);

      return {
        success: false,
        error: "Unable to save the generated session plan.",
      };
    }

    revalidatePath(`/tutor/sessions/${session.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Session plan generation failed:", error);

    return {
      success: false,
      error: "Unable to generate the session plan. Please try again.",
    };
  }
}

export type GenerateSessionReviewResult = {
  success: boolean;
  error?: string;
};

export async function generateSessionReviewAction(
  sessionId: string,
): Promise<GenerateSessionReviewResult> {
  try {
    const currentUser = await requireTutor();

    const supabase = await createClient();

    // ---------------------------------------------
    // Session + ownership
    // ---------------------------------------------

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(
        `
                id,
                tutor_id,
                student_id,
                topic,
                starts_at,
                ends_at,
                status,
                live_notes
            `,
      )
      .eq("id", sessionId)
      .eq("tutor_id", currentUser.user.id)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return {
        success: false,
        error: "Session not found.",
      };
    }

    if (session.status !== "completed") {
      return {
        success: false,
        error: "Only completed sessions can be reviewed.",
      };
    }

    if (!session.live_notes.trim()) {
      return {
        success: false,
        error: "Add session notes before generating the AI review.",
      };
    }

    // ---------------------------------------------
    // Avoid unnecessary AI generation.
    // ---------------------------------------------

    const { data: existingDebrief, error: debriefError } = await supabase
      .from("session_debriefs")
      .select("id")
      .eq("session_id", session.id)
      .maybeSingle();

    if (debriefError) {
      throw new Error(debriefError.message);
    }

    if (existingDebrief) {
      return {
        success: false,
        error: "An AI review already exists for this session.",
      };
    }

    // ---------------------------------------------
    // Student context
    // ---------------------------------------------

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
      .eq("id", session.student_id)
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

    // ---------------------------------------------
    // Original session plan is useful context but
    // not required.
    // ---------------------------------------------

    const { data: storedPlan, error: planError } = await supabase
      .from("session_plans")
      .select(
        `
                objectives,
                lesson_outline,
                practice_questions
            `,
      )
      .eq("session_id", session.id)
      .maybeSingle();

    if (planError) {
      throw new Error(planError.message);
    }

    let sessionPlan = null;

    if (storedPlan) {
      const parsedPlan = SessionPlanSchema.safeParse({
        objectives: storedPlan.objectives,

        lesson_outline: storedPlan.lesson_outline,

        practice_questions: storedPlan.practice_questions,
      });

      if (parsedPlan.success) {
        sessionPlan = parsedPlan.data;
      } else {
        console.error("Invalid stored session plan:", parsedPlan.error);
      }
    }

    // ---------------------------------------------
    // Duration
    // ---------------------------------------------

    const startsAt = new Date(session.starts_at);

    const endsAt = new Date(session.ends_at);

    const durationMinutes = Math.round(
      (endsAt.getTime() - startsAt.getTime()) / 60_000,
    );

    // ---------------------------------------------
    // Generate first.
    //
    // Nothing has been written to the database yet.
    // ---------------------------------------------

    const generated = await generateSessionDebrief({
      subject: student.subject,

      currentLevel: student.current_level,

      learningGoals: student.learning_goals,

      weakAreas: student.weak_areas,

      topic: session.topic,

      durationMinutes,

      liveNotes: session.live_notes,

      sessionPlan,
    });

    // ---------------------------------------------
    // One atomic DB mutation:
    //
    // INSERT debrief
    // +
    // completed → ai_reviewed
    // ---------------------------------------------

    const { error: saveError } = await supabase.rpc(
      "save_session_debrief_and_review",
      {
        p_session_id: session.id,

        p_summary: generated.debrief.summary,

        p_homework: generated.debrief.homework,

        p_next_focus: generated.debrief.next_focus,

        p_model: generated.model,
      },
    );

    if (saveError) {
      console.error("Failed to save AI review:", saveError);

      return {
        success: false,
        error: "Unable to save the AI review. Please try again.",
      };
    }

    revalidatePath(`/tutor/sessions/${session.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Session review generation failed:", error);

    return {
      success: false,
      error: "Unable to generate the AI review. Please try again.",
    };
  }
}
