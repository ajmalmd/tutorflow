type SessionStatus =
    | "scheduled"
    | "in_progress"
    | "completed"
    | "ai_reviewed";

const statusStyles: Record<SessionStatus, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    completed: "bg-green-50 text-green-700",
    ai_reviewed: "bg-purple-50 text-purple-700",
};

const statusLabels: Record<SessionStatus, string> = {
    scheduled: "Scheduled",
    in_progress: "In progress",
    completed: "Completed",
    ai_reviewed: "AI reviewed",
};

type SessionStatusBadgeProps = {
    status: SessionStatus;
    startsAt?: string;
};

export function SessionStatusBadge({
    status,
    startsAt,
}: SessionStatusBadgeProps) {

    const isMissed =
        status === "scheduled" &&
        startsAt &&
        new Date(startsAt).getTime() < Date.now();

    if (isMissed) {
        return (
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                Missed
            </span>
        );
    }

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
}