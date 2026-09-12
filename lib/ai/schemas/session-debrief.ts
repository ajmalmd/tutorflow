import { z } from "zod";

export const SessionDebriefSchema = z.object({
  summary: z.string().min(1),

  homework: z
    .array(
      z.object({
        task: z.string().min(1),
        instructions: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),

  next_focus: z.string().min(1),
});

export type SessionDebrief = z.infer<typeof SessionDebriefSchema>;
