import type { SessionPlanContext } from "@/lib/ai/types";

export function buildSessionPlanPrompt(context: SessionPlanContext) {
  return `
        You are helping a tutor prepare a focused one-on-one tutoring session.

        Student learning profile:
        - Subject: ${context.subject}
        - Current level: ${context.currentLevel}
        - Learning goals: ${context.learningGoals || "Not provided"}
        - Weak areas: ${context.weakAreas || "Not provided"}

        Upcoming session:
        - Topic: ${context.topic}
        - Duration: ${context.durationMinutes} minutes

        Create a practical tutoring plan.

        Requirements:
        - Give 2 to 4 clear learning objectives.
        - Build a lesson outline appropriate for the available session duration.
        - Each lesson-outline item must contain a title, duration in minutes, and activity.
        - The combined outline should fit approximately within the session duration.
        - Give 3 to 6 practice questions.
        - Include an answer for every practice question.
        - Adapt difficulty to the student's current level.
        - Give extra attention to relevant weak areas.
        - Keep activities realistic for one-on-one tutoring.
    `.trim();
}
