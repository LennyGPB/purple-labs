"use client";

import { CalendarIcon, ClockIcon, XIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

type DateTimeFieldsProps = {
  date: string;
  time: string;
  onChange: (value: { date: string; time: string }) => void;
};

/** Date et heure optionnelles. L'heure n'est disponible qu'une fois la date choisie. */
export function DateTimeFields({ date, time, onChange }: DateTimeFieldsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          type="date"
          aria-label="Date"
          value={date}
          onChange={(e) => onChange({ date: e.target.value, time: e.target.value ? time : "" })}
          className="pl-9"
        />
      </div>
      <div className="relative w-32">
        <ClockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
        <Input
          type="time"
          aria-label="Heure"
          value={time}
          disabled={!date}
          onChange={(e) => onChange({ date, time: e.target.value })}
          className="pl-9"
        />
      </div>
      {(date || time) && (
        <IconButton label="Retirer la date" onClick={() => onChange({ date: "", time: "" })}>
          <XIcon className="size-4" />
        </IconButton>
      )}
    </div>
  );
}
