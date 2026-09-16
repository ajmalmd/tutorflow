import { z } from "zod";

export const ProgressSummarySchema = z.object({
  overall_progress: z.string().min(1),

  improvements: z.array(z.string().min(1)).max(5),

  recurring_challenges: z.array(z.string().min(1)).max(5),

  recommended_focus: z.array(z.string().min(1)).min(1).max(5),
});

export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;
