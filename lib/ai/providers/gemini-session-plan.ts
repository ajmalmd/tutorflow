import { z } from "zod";

import { gemini_ai } from "@/lib/gemini/client";

import { SessionPlanSchema } from "@/lib/ai/schemas/session-plan";

import { buildSessionPlanPrompt } from "@/lib/ai/prompts/session-plan";

import type { GeneratedSessionPlan, SessionPlanContext } from "@/lib/ai/types";

export async function generateGeminiSessionPlan(
  context: SessionPlanContext,
): Promise<GeneratedSessionPlan> {
  const model = process.env.GEMINI_MODEL;

  if (!model) {
    throw new Error("GEMINI_MODEL is not configured");
  }

  const interaction = await gemini_ai.interactions.create({
    model,

    input: buildSessionPlanPrompt(context),

    response_format: [
      {
        type: "text",
        mime_type: "application/json",
        schema: z.toJSONSchema(SessionPlanSchema),
      },
    ],
  });

  if (!interaction.output_text) {
    throw new Error("Gemini returned an empty response");
  }

  const raw = JSON.parse(interaction.output_text);

  const plan = SessionPlanSchema.parse(raw);

  return {
    plan,
    model: `gemini:${model}`,
  };
}
