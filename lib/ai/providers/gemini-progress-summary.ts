import { z } from "zod";

import { gemini_ai } from "@/lib/gemini/client";

import { ProgressSummarySchema } from "@/lib/ai/schemas/progress-summary";

import { buildProgressSummaryPrompt } from "@/lib/ai/prompts/progress-summary";

import type {
  GeneratedProgressSummary,
  ProgressSummaryContext,
} from "@/lib/ai/types";

export async function generateGeminiProgressSummary(
  context: ProgressSummaryContext,
): Promise<GeneratedProgressSummary> {
  const model = process.env.GEMINI_MODEL;

  if (!model) {
    throw new Error("GEMINI_MODEL is not configured");
  }

  const interaction = await gemini_ai.interactions.create({
    model,

    input: buildProgressSummaryPrompt(context),

    response_format: [
      {
        type: "text",
        mime_type: "application/json",

        schema: z.toJSONSchema(ProgressSummarySchema),
      },
    ],
  });

  if (!interaction.output_text) {
    throw new Error("Gemini returned an empty progress summary");
  }

  const raw = JSON.parse(interaction.output_text);

  const summary = ProgressSummarySchema.parse(raw);

  return {
    summary,
    model: `gemini:${model}`,
  };
}
