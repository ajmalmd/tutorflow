"use client";

import { CalendarDays, Clock, } from "lucide-react";
import { type ChangeEvent, type HTMLInputTypeAttribute, useRef } from "react";

type PickerInputProps = {
    id: string;
    type: "date" | "time";
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    min?: string;
};

export function PickerInput({
    id,
    type,
    value,
    onChange,
    required,
    min,
}: PickerInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const Icon = type === "date" ? CalendarDays : Clock;

    function openPicker() {
        inputRef.current?.showPicker?.();
    }

    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
                ref={inputRef}
                id={id}
                type={type}
                required={required}
                min={min}
                value={value}
                onChange={onChange}
                onClick={openPicker}
                className="
                    h-11 w-full cursor-pointer rounded-lg
                    border border-gray-200 bg-white
                    pl-9 pr-3 text-sm text-gray-900
                    outline-none transition
                    hover:border-gray-300
                    focus:border-gray-900
                    focus:ring-2 focus:ring-gray-900/10
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                "
            />
        </div>
    );
}