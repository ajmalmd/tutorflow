import type { SessionDebriefContext } from "@/lib/ai/types";

export function buildSessionDebriefPrompt(context: SessionDebriefContext) {
  const planContext = context.sessionPlan
    ? `
        Original session plan:

        Objectives:
        ${context.sessionPlan.objectives
          .map((objective) => `- ${objective}`)
          .join("\n")}

        Lesson outline:
        ${context.sessionPlan.lesson_outline
          .map(
            (item) => `- ${item.title} (${item.minutes} min): ${item.activity}`,
          )
          .join("\n")}
    `
    : `
        No AI session plan was created for this session.
    `;

  return `
        You are helping a tutor create a post-session review for a one-on-one tutoring session.

        Student learning profile:
        - Subject: ${context.subject}
        - Current level: ${context.currentLevel}
        - Learning goals: ${context.learningGoals || "Not provided"}
        - Weak areas: ${context.weakAreas || "Not provided"}

        Completed session:
        - Topic: ${context.topic}
        - Duration: ${context.durationMinutes} minutes

        Tutor's live notes:
        ${context.liveNotes.trim() || "No tutor notes were provided."}

        ${planContext}

        Create a concise and useful post-session review.

        Requirements:

        1. Summary
        - Summarize what was covered.
        - Describe progress only when supported by the tutor's notes.
        - Do not invent student performance, understanding, mistakes, or achievements.
        - If the notes do not provide enough evidence about progress, keep the summary factual.

        2. Homework
        - Give 1 to 5 practical homework tasks.
        - Homework should reinforce the session topic and relevant weak areas.
        - Each task must include clear instructions.
        - Keep the workload reasonable for the student's level.

        3. Next focus
        - Recommend the most useful focus for the next tutoring session.
        - Base this primarily on the tutor's notes, learning goals, weak areas, and current topic.

        Do not include information that is not supported by the supplied session context.
    `.trim();
}
