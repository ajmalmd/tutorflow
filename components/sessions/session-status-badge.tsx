type SessionStatus =
    | "scheduled"
    | "in_progress"
    | "completed"
    | "ai_reviewed";


type SessionStatusBadgeProps = {
    status: SessionStatus;
    startsAt?: string;
};

const statusStyles = {
    scheduled: "bg-gray-100 text-gray-600 ring-gray-500/10",
    in_progress: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    completed: "bg-blue-50 text-blue-700 ring-blue-600/20",
    ai_reviewed: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

const statusLabels = {
    scheduled: "Scheduled",
    in_progress: "In progress",
    completed: "Completed",
    ai_reviewed: "AI reviewed",
};

export function SessionStatusBadge({ status, startsAt }: SessionStatusBadgeProps) {
    const isMissed =
        status === "scheduled" &&
        startsAt &&
        new Date(startsAt).getTime() < Date.now();

    if (isMissed) {
        return (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                Missed
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
}