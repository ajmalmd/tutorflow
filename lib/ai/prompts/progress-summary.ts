import type { ProgressSummaryContext } from "@/lib/ai/types";

export function buildProgressSummaryPrompt(
  context: ProgressSummaryContext,
): string {
  const reviewedSessions = context.reviewedSessions
    .map(
      (session, index) => `
            Reviewed session ${index + 1}
            Topic: ${session.topic}
            Reviewed at: ${session.reviewedAt}

            Session summary:
            ${session.summary}

            Homework:
            ${
              session.homework.length > 0
                ? session.homework
                    .map((item) => `- ${item.task}: ${item.instructions}`)
                    .join("\n")
                : "No homework recorded."
            }

            Next focus:
            ${session.nextFocus}
        `,
    )
    .join("\n---\n");

  return `
        You are helping a tutor understand a student's learning progress across reviewed tutoring sessions.

        Create a concise progress summary using ONLY the information provided below.

        STUDENT PROFILE

        Subject:
        ${context.subject}

        Current level:
        ${context.currentLevel}

        Learning goals:
        ${context.learningGoals || "Not provided"}

        Known areas to improve:
        ${context.weakAreas || "Not provided"}

        REVIEWED SESSION HISTORY

        ${reviewedSessions}

        INSTRUCTIONS

        - Base every observation strictly on the supplied student profile and reviewed session history.
        - Do not invent performance, scores, mastery, improvement, decline, strengths, weaknesses, or trends that are not supported by the session history.
        - Treat the student profile as background context, not proof that progress has occurred.
        - "improvements" must contain only improvements supported by evidence across the reviewed session history.
        - If improvement cannot be established from the history, return an empty improvements array.
        - "recurring_challenges" must contain only challenges that appear repeatedly or remain supported across the history.
        - If recurring challenges cannot be established, return an empty recurring_challenges array.
        - With only one reviewed session, do not claim longitudinal improvement, decline, or recurring patterns.
        - "overall_progress" should accurately summarize what the reviewed history demonstrates. If there is insufficient history to establish progress over time, explicitly say so and summarize the current observations instead.
        - "recommended_focus" should be grounded in the recorded next-focus items, session summaries, homework, learning goals, and supported challenges.
        - Do not diagnose learning disabilities or make psychological, behavioral, or medical claims.
        - Keep the response concise and useful to the tutor.
    `;
}
