"use client";

import { CheckIcon, ClockIcon, TrashIcon } from "@/components/icons";
import { Checkbox } from "@/components/ui/Checkbox";
import { SwipeRow } from "@/components/ui/SwipeRow";
import { cn } from "@/lib/cn";
import { dayKey, formatDue } from "@/lib/dates";
import type { TaskView } from "./types";

type TaskItemProps = {
  task: TaskView;
  todayKey: string;
  /** Nom de la catégorie à afficher (omis quand on filtre déjà dessus) */
  categoryName?: string;
  onToggle: (task: TaskView) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskView) => void;
};

/** Tâche : glisser à droite pour terminer (ou rouvrir), à gauche pour supprimer. */
export function TaskItem({ task, todayKey, categoryName, onToggle, onDelete, onEdit }: TaskItemProps) {
  const overdue = !task.done && task.dueAt !== null && dayKey(task.dueAt) < todayKey;
  const isTemp = task.id.startsWith("temp-");

  return (
    <li className="animate-fade-in">
      <SwipeRow
        right={
          isTemp
            ? undefined
            : {
                label: task.done ? "Rouvrir" : "Terminer",
                icon: <CheckIcon className="size-5" strokeWidth={2.4} />,
                className: "bg-violet-600",
                onTrigger: () => onToggle(task),
              }
        }
        left={
          isTemp
            ? undefined
            : {
                label: "Supprimer",
                icon: <TrashIcon className="size-5" />,
                className: "bg-rose-600",
                onTrigger: () => onDelete(task.id),
                exit: "collapse",
              }
        }
      >
        <div className="flex items-center gap-3 px-4 py-3">
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
        </div>
      </SwipeRow>
    </li>
  );
}
