import { generateGeminiSessionDebrief } from "@/lib/ai/providers/gemini-session-debrief";

import { generateOpenAISessionDebrief } from "@/lib/ai/providers/openai-session-debrief";

import type {
  GeneratedSessionDebrief,
  SessionDebriefContext,
} from "@/lib/ai/types";

export async function generateSessionDebrief(
  context: SessionDebriefContext,
): Promise<GeneratedSessionDebrief> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini":
      return generateGeminiSessionDebrief(context);

    case "openai":
      return generateOpenAISessionDebrief(context);

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
