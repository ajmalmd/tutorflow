"use client";

import { useActionState, useEffect, useState } from "react";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { PickerInput } from "../ui/picket-input";

import { scheduleSession, type ScheduleSessionState } from "@/app/tutor/students/[id]/actions";

const initialState: ScheduleSessionState = { success: false };

type ScheduleSessionFormProps = { studentId: string };

export function ScheduleSessionForm({ studentId }: ScheduleSessionFormProps) {
    const scheduleSessionForStudent = scheduleSession.bind(null, studentId);

    const [state, formAction, pending] = useActionState(
        scheduleSessionForStudent,
        initialState,
    );

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [startsAt, setStartsAt] = useState("");

    const today = new Date().toLocaleDateString("en-CA");

    useEffect(() => {
        if (!date || !startTime) {
            setStartsAt("");
            return;
        }

        const localDate = new Date(`${date}T${startTime}`);

        if (Number.isNaN(localDate.getTime())) {
            setStartsAt("");
            return;
        }

        setStartsAt(localDate.toISOString());
    }, [date, startTime]);

    return (
        <form
            action={formAction}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Schedule session
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                    Choose a topic, date, and duration for the session.
                </p>
            </div>

            <div className="mt-6 space-y-5">
                {/* Topic */}
                <div>
                    <label
                        htmlFor="topic"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Topic
                    </label>

                    <input
                        id="topic"
                        name="topic"
                        type="text"
                        required
                        placeholder="e.g. Quadratic equations"
                        className="
                            h-11 w-full rounded-lg border border-gray-200
                            bg-white px-3 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            hover:border-gray-300
                            focus:border-gray-900
                            focus:ring-2 focus:ring-gray-900/10
                        "
                    />

                    {state.errors?.topic?.map((error) => (
                        <p
                            key={error}
                            className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
                        >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </p>
                    ))}
                </div>

                {/* Date + time */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="date"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Date
                        </label>

                        <PickerInput
                            id="date"
                            type="date"
                            required
                            min={today}
                            value={date}
                            onChange={(event) =>
                                setDate(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="start-time"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Start time
                        </label>

                        <PickerInput
                            id="start-time"
                            type="time"
                            required
                            value={startTime}
                            onChange={(event) =>
                                setStartTime(event.target.value)
                            }
                        />
                    </div>
                </div>

                <input
                    type="hidden"
                    name="starts_at"
                    value={startsAt}
                />

                {state.errors?.starts_at?.map((error) => (
                    <p
                        key={error}
                        className="flex items-center gap-1.5 text-sm text-red-600"
                    >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                    </p>
                ))}

                {/* Duration */}
                <div>
                    <label
                        htmlFor="duration"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Duration
                    </label>

                    <select
                        id="duration"
                        name="duration"
                        defaultValue="60"
                        className="
                            h-11 w-full rounded-lg border border-gray-200
                            bg-white px-3 text-sm text-gray-900
                            outline-none transition
                            hover:border-gray-300
                            focus:border-gray-900
                            focus:ring-2 focus:ring-gray-900/10
                        "
                    >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                    </select>

                    {state.errors?.duration?.map((error) => (
                        <p
                            key={error}
                            className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600"
                        >
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {error}
                        </p>
                    ))}
                </div>

                {/* Form response */}
                {state.message && (
                    <div
                        role="status"
                        className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${state.success
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                            }`}
                    >
                        {state.success ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        )}

                        <span>{state.message}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={pending || !startsAt}
                    className="
                        flex h-10 items-center justify-center gap-2
                        rounded-lg bg-gray-900 px-4
                        text-sm font-medium text-white
                        transition
                        hover:bg-gray-800
                        focus:outline-none focus:ring-2
                        focus:ring-gray-900 focus:ring-offset-2
                        disabled:cursor-not-allowed disabled:opacity-60
                    "
                >
                    {pending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {pending
                        ? "Scheduling..."
                        : "Schedule session"}
                </button>
            </div>
        </form>
    );
}