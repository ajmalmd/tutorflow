import { generateGeminiProgressSummary } from "@/lib/ai/providers/gemini-progress-summary";

import { generateOpenAIProgressSummary } from "@/lib/ai/providers/openai-progress-summary";

import type {
  GeneratedProgressSummary,
  ProgressSummaryContext,
} from "@/lib/ai/types";

export async function generateProgressSummary(
  context: ProgressSummaryContext,
): Promise<GeneratedProgressSummary> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini":
      return generateGeminiProgressSummary(context);

    case "openai":
      return generateOpenAIProgressSummary(context);

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
