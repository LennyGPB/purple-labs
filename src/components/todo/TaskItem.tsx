"use client";

import { ClockIcon } from "@/components/icons";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import { dayKey, formatDue } from "@/lib/dates";
import type { TaskView } from "./types";

type TaskItemProps = {
  task: TaskView;
  todayKey: string;
  /** Nom de la catégorie à afficher (omis quand on filtre déjà dessus) */
  categoryName?: string;
  onToggle: (task: TaskView) => void;
  onEdit: (task: TaskView) => void;
};

export function TaskItem({ task, todayKey, categoryName, onToggle, onEdit }: TaskItemProps) {
  const overdue = !task.done && task.dueAt !== null && dayKey(task.dueAt) < todayKey;

  return (
    <li className="flex animate-fade-in items-center gap-3 px-4 py-3">
      <Checkbox checked={task.done} onChange={() => onToggle(task)} label={`Marquer « ${task.title} » comme faite`} />
      <button type="button" onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block truncate text-[15px] transition-colors duration-300",
            task.done ? "text-zinc-500 line-through" : "text-white",
          )}
        >
          {task.title}
        </span>
        {(task.dueAt || categoryName) && (
          <span className="mt-0.5 flex items-center gap-2 text-xs">
            {task.dueAt && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  overdue ? "text-rose-300" : task.done ? "text-zinc-600" : "text-zinc-500",
                )}
              >
                <ClockIcon className="size-3.5" />
                {overdue && "En retard · "}
                {formatDue(task.dueAt, task.hasTime, todayKey)}
              </span>
            )}
            {categoryName && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-px text-[10px] font-medium tracking-wide text-zinc-400">
                {categoryName}
              </span>
            )}
          </span>
        )}
      </button>
    </li>
  );
}
