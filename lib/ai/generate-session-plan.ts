import { generateGeminiSessionPlan } from "@/lib/ai/providers/gemini-session-plan";

import { generateOpenAISessionPlan } from "@/lib/ai/providers/openai-session-plan";

import type { GeneratedSessionPlan, SessionPlanContext } from "@/lib/ai/types";

export async function generateSessionPlan(
  context: SessionPlanContext,
): Promise<GeneratedSessionPlan> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  let result: GeneratedSessionPlan;

  switch (provider) {
    case "gemini":
      result = await generateGeminiSessionPlan(context);
      break;

    case "openai":
      result = await generateOpenAISessionPlan(context);
      break;

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  validatePlanDuration(result.plan.lesson_outline, context.durationMinutes);

  return result;
}

function validatePlanDuration(
  outline: {
    minutes: number;
  }[],
  sessionDuration: number,
) {
  const plannedMinutes = outline.reduce(
    (total, item) => total + item.minutes,
    0,
  );

  // Small tolerance is fine.
  // A 60-minute session becoming a
  // 70-minute plan is acceptable.
  const maxAllowed = sessionDuration + 10;

  if (plannedMinutes > maxAllowed) {
    throw new Error(
      `AI generated ${plannedMinutes} minutes of content for a ${sessionDuration}-minute session`,
    );
  }
}
