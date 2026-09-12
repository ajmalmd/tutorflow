import type { SessionPlan } from "@/lib/ai/schemas/session-plan";

export type SessionPlanContext = {
  subject: string;
  currentLevel: string;
  learningGoals: string;
  weakAreas: string;
  topic: string;
  durationMinutes: number;
};

export type GeneratedSessionPlan = {
  plan: {
    objectives: string[];

    lesson_outline: {
      title: string;
      minutes: number;
      activity: string;
    }[];

    practice_questions: {
      question: string;
      answer: string;
    }[];
  };

  model: string;
};

export type SessionDebriefContext = {
  subject: string;
  currentLevel: string;
  learningGoals: string;
  weakAreas: string;

  topic: string;
  durationMinutes: number;

  liveNotes: string;

  sessionPlan?: SessionPlan | null;
};

export type GeneratedSessionDebrief = {
  debrief: {
    summary: string;

    homework: {
      task: string;
      instructions: string;
    }[];

    next_focus: string;
  };

  model: string;
};
