import { z } from "zod";

export const SESSION_DURATIONS = [30, 45, 60, 90] as const;

export const scheduleSessionSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, "Topic is required.")
    .max(200, "Topic must be 200 characters or less."),

  starts_at: z
    .string()
    .min(1, "Start time is required.")
    .refine(
      (value) => {
        const date = new Date(value);

        return !Number.isNaN(date.getTime());
      },
      {
        message: "Start time is invalid.",
      },
    )
    .refine(
      (value) => {
        const date = new Date(value);

        return date.getTime() > Date.now();
      },
      {
        message: "Session must be scheduled in the future.",
      },
    ),

  duration: z.coerce
    .number()
    .refine(
      (duration) =>
        SESSION_DURATIONS.includes(
          duration as (typeof SESSION_DURATIONS)[number],
        ),
      {
        message: "Invalid session duration.",
      },
    ),
});
