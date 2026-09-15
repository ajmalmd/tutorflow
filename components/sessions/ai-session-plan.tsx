import {
    CircleCheck,
    Clock,
    HelpCircle,
    ListChecks,
} from "lucide-react";

import type { SessionPlan } from "@/lib/ai/schemas/session-plan";

type AISessionPlanProps = { plan: SessionPlan };

export function AISessionPlan({ plan }: AISessionPlanProps) {
    return (
        <div className="space-y-7">
            {/* Objectives */}
            <section>
                <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Objectives
                    </h3>
                </div>

                <ul className="mt-3 space-y-2">
                    {plan.objectives.map((objective, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-2.5 text-sm leading-6 text-gray-600"
                        >
                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                            <span>{objective}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Lesson outline */}
            <section>
                <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Lesson outline
                    </h3>
                </div>

                <div className="mt-3 space-y-2">
                    {plan.lesson_outline.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                                        {index + 1}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.title}
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-gray-500">
                                            {item.activity}
                                        </p>
                                    </div>
                                </div>

                                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    {item.minutes} min
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Practice questions */}
            <section>
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-gray-500" />

                    <h3 className="text-sm font-semibold text-gray-900">
                        Practice questions
                    </h3>
                </div>

                <div className="mt-3 space-y-2">
                    {plan.practice_questions.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-gray-200 p-4"
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                    {index + 1}
                                </span>

                                <div>
                                    <p className="text-sm font-medium leading-6 text-gray-900">
                                        {item.question}
                                    </p>

                                    <div className="mt-2 rounded-md bg-gray-50 px-3 py-2">
                                        <span className="text-xs font-medium text-gray-400">
                                            Answer
                                        </span>

                                        <p className="mt-0.5 text-sm text-gray-600">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}