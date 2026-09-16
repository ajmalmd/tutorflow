import { z } from "zod";

import { openai } from "@/lib/openai/client";

import { ProgressSummarySchema } from "@/lib/ai/schemas/progress-summary";

import { buildProgressSummaryPrompt } from "@/lib/ai/prompts/progress-summary";

import type {
  GeneratedProgressSummary,
  ProgressSummaryContext,
} from "@/lib/ai/types";

export async function generateOpenAIProgressSummary(
  context: ProgressSummaryContext,
): Promise<GeneratedProgressSummary> {
  const model = process.env.OPENAI_MODEL;

  if (!model) {
    throw new Error("OPENAI_MODEL is not configured");
  }

  const response = await openai.responses.create({
    model,

    input: buildProgressSummaryPrompt(context),

    text: {
      format: {
        type: "json_schema",
        name: "progress_summary",
        strict: true,

        schema: z.toJSONSchema(ProgressSummarySchema),
      },
    },
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty progress summary");
  }

  const raw = JSON.parse(response.output_text);

  const summary = ProgressSummarySchema.parse(raw);

  return {
    summary,
    model: `openai:${model}`,
  };
}
