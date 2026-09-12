import type { SessionPlan } from "@/lib/ai/schemas/session-plan";

type AISessionPlanProps = {
    plan: SessionPlan;
};

export function AISessionPlan({ plan }: AISessionPlanProps) {
    return (
        <section className="rounded-xl border bg-white p-6">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    AI Session Plan
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                    Preparation
                </h2>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Objectives
                </h3>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                    {plan.objectives.map(
                        (objective, index) => (
                            <li key={index}>
                                {objective}
                            </li>
                        ),
                    )}
                </ul>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Lesson outline
                </h3>

                <div className="mt-3 space-y-3">
                    {plan.lesson_outline.map(
                        (item, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <p className="font-medium">
                                        {item.title}
                                    </p>

                                    <span className="shrink-0 text-sm text-gray-500">
                                        {item.minutes} min
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">
                                    {item.activity}
                                </p>
                            </div>
                        ),
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">
                    Practice questions
                </h3>

                <div className="mt-3 space-y-4">
                    {plan.practice_questions.map(
                        (item, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <p className="text-sm font-medium">
                                    {index + 1}.{" "}
                                    {item.question}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    Answer:{" "}
                                    {item.answer}
                                </p>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}