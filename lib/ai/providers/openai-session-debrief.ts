import { z } from "zod";

import { openai } from "@/lib/openai/client";

import { SessionDebriefSchema } from "@/lib/ai/schemas/session-debrief";

import { buildSessionDebriefPrompt } from "@/lib/ai/prompts/session-debrief";

import type {
  GeneratedSessionDebrief,
  SessionDebriefContext,
} from "@/lib/ai/types";

export async function generateOpenAISessionDebrief(
  context: SessionDebriefContext,
): Promise<GeneratedSessionDebrief> {
  const model = process.env.OPENAI_MODEL;

  if (!model) {
    throw new Error("OPENAI_MODEL is not configured");
  }

  const response = await openai.responses.create({
    model,

    input: buildSessionDebriefPrompt(context),

    text: {
      format: {
        type: "json_schema",
        name: "session_debrief",
        strict: true,

        schema: z.toJSONSchema(SessionDebriefSchema),
      },
    },
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty debrief");
  }

  const raw = JSON.parse(response.output_text);

  const debrief = SessionDebriefSchema.parse(raw);

  return {
    debrief,
    model: `openai:${model}`,
  };
}
