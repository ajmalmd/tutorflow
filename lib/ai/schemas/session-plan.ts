import { z } from "zod";

export const SessionPlanSchema = z.object({
  objectives: z.array(z.string().min(1)).min(2).max(4),

  lesson_outline: z
    .array(
      z.object({
        title: z.string().min(1),
        minutes: z.number().int().positive(),
        activity: z.string().min(1),
      }),
    )
    .min(1),

  practice_questions: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(3)
    .max(6),
});

export type SessionPlan = z.infer<typeof SessionPlanSchema>;
