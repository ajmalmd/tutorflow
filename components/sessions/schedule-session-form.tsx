"use client";

import {
    useActionState,
    useEffect,
    useState,
} from "react";

import {
    scheduleSession,
    type ScheduleSessionState,
} from "@/app/tutor/students/[id]/actions";

const initialState: ScheduleSessionState = {
    success: false,
};

type ScheduleSessionFormProps = {
    studentId: string;
};

export function ScheduleSessionForm({
    studentId,
}: ScheduleSessionFormProps) {
    const scheduleSessionForStudent =
        scheduleSession.bind(null, studentId);

    const [state, formAction, pending] = useActionState(
        scheduleSessionForStudent,
        initialState,
    );

    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [startsAt, setStartsAt] = useState("");

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
            className="space-y-5 rounded-xl border bg-white p-6"
        >
            <div>
                <h2 className="text-xl font-semibold">
                    Schedule session
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Choose when and what you want to cover.
                </p>
            </div>

            <div>
                <label
                    htmlFor="topic"
                    className="mb-1 block text-sm font-medium"
                >
                    Topic
                </label>

                <input
                    id="topic"
                    name="topic"
                    type="text"
                    required
                    placeholder="e.g. Quadratic equations"
                    className="w-full rounded-lg border px-3 py-2"
                />

                {state.errors?.topic?.map((error) => (
                    <p
                        key={error}
                        className="mt-1 text-sm text-red-600"
                    >
                        {error}
                    </p>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="date"
                        className="mb-1 block text-sm font-medium"
                    >
                        Date
                    </label>

                    <input
                        id="date"
                        type="date"
                        required
                        value={date}
                        onChange={(event) =>
                            setDate(event.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="start-time"
                        className="mb-1 block text-sm font-medium"
                    >
                        Start time
                    </label>

                    <input
                        id="start-time"
                        type="time"
                        required
                        value={startTime}
                        onChange={(event) =>
                            setStartTime(event.target.value)
                        }
                        className="w-full rounded-lg border px-3 py-2"
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
                    className="text-sm text-red-600"
                >
                    {error}
                </p>
            ))}

            <div>
                <label
                    htmlFor="duration"
                    className="mb-1 block text-sm font-medium"
                >
                    Duration
                </label>

                <select
                    id="duration"
                    name="duration"
                    defaultValue="60"
                    className="w-full rounded-lg border px-3 py-2"
                >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                </select>

                {state.errors?.duration?.map((error) => (
                    <p
                        key={error}
                        className="mt-1 text-sm text-red-600"
                    >
                        {error}
                    </p>
                ))}
            </div>

            {state.message && (
                <p
                    className={
                        state.success
                            ? "text-sm text-green-700"
                            : "text-sm text-red-600"
                    }
                >
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                disabled={pending || !startsAt}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending
                    ? "Scheduling..."
                    : "Schedule session"}
            </button>
        </form>
    );
}