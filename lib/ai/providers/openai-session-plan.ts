import { z } from "zod";

import { openai } from "@/lib/openai/client";

import { SessionPlanSchema } from "@/lib/ai/schemas/session-plan";

import { buildSessionPlanPrompt } from "@/lib/ai/prompts/session-plan";

import type { GeneratedSessionPlan, SessionPlanContext } from "@/lib/ai/types";

export async function generateOpenAISessionPlan(
  context: SessionPlanContext,
): Promise<GeneratedSessionPlan> {
  const model = process.env.OPENAI_MODEL;

  if (!model) {
    throw new Error("OPENAI_MODEL is not configured");
  }

  const response = await openai.responses.create({
    model,

    input: buildSessionPlanPrompt(context),

    text: {
      format: {
        type: "json_schema",
        name: "session_plan",
        strict: true,
        schema: z.toJSONSchema(SessionPlanSchema),
      },
    },
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty response");
  }

  const raw = JSON.parse(response.output_text);

  const plan = SessionPlanSchema.parse(raw);

  return {
    plan,
    model: `openai:${model}`,
  };
}
