import { z } from "zod";

import { gemini_ai } from "@/lib/gemini/client";

import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";

import { buildSessionDebriefPrompt } from "@/lib/ai/prompts/session-debrief";

import type {
  GeneratedSessionDebrief,
  SessionDebriefContext,
} from "@/lib/ai/types";

export async function generateGeminiSessionDebrief(
  context: SessionDebriefContext,
): Promise<GeneratedSessionDebrief> {
  const model = process.env.GEMINI_MODEL;

  if (!model) {
    throw new Error("GEMINI_MODEL is not configured");
  }

  const interaction = await gemini_ai.interactions.create({
    model,

    input: buildSessionDebriefPrompt(context),

    response_format: [
      {
        type: "text",
        mime_type: "application/json",

        schema: z.toJSONSchema(SessionDebriefSchema),
      },
    ],
  });

  if (!interaction.output_text) {
    throw new Error("Gemini returned an empty debrief");
  }

  const raw = JSON.parse(interaction.output_text);

  const debrief = SessionDebriefSchema.parse(raw);

  return {
    debrief,
    model: `gemini:${model}`,
  };
}
