"use client";

import { startTransition, useOptimistic, useState } from "react";
import { createTask, deleteTask, setTaskDone, updateTask, type TaskInput } from "@/actions/tasks";
import { ChecklistIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { dayKey, zonedToUtc } from "@/lib/dates";
import { QuickAddTask } from "./QuickAddTask";
import { TaskEditSheet } from "./TaskEditSheet";
import { TaskItem } from "./TaskItem";
import { TaskSection } from "./TaskSection";
import type { TaskView } from "./types";

type OptimisticAction =
  | { type: "add"; task: TaskView }
  | { type: "update"; id: string; patch: Partial<TaskView> }
  | { type: "delete"; id: string };

function reducer(tasks: TaskView[], action: OptimisticAction): TaskView[] {
  switch (action.type) {
    case "add":
      return [action.task, ...tasks];
    case "update":
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
    case "delete":
      return tasks.filter((t) => t.id !== action.id);
  }
}

/** Calcule localement l'échéance pour l'affichage optimiste. */
function dueFromInput(input: TaskInput): Pick<TaskView, "dueAt" | "hasTime"> {
  if (!input.date) return { dueAt: null, hasTime: false };
  return { dueAt: zonedToUtc(input.date, input.time ?? undefined), hasTime: Boolean(input.time) };
}

type DatedTask = TaskView & { dueAt: Date };

const byDue = (a: DatedTask, b: DatedTask) => a.dueAt.getTime() - b.dueAt.getTime();

export function TodoBoard({ tasks }: { tasks: TaskView[] }) {
  const [optimisticTasks, apply] = useOptimistic(tasks, reducer);
  const [editing, setEditing] = useState<TaskView | null>(null);
  const todayKey = dayKey(new Date());

  const pending = optimisticTasks.filter((t) => !t.done);
  const dated = pending.filter((t): t is DatedTask => t.dueAt !== null);
  const today = dated.filter((t) => dayKey(t.dueAt) <= todayKey).sort(byDue);
  const upcoming = dated.filter((t) => dayKey(t.dueAt) > todayKey).sort(byDue);
  const undated = pending.filter((t) => t.dueAt === null);
  const done = optimisticTasks
    .filter((t) => t.done)
    .sort((a, b) => (b.doneAt?.getTime() ?? 0) - (a.doneAt?.getTime() ?? 0));

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  const handleAdd = (input: TaskInput) =>
    run(
      {
        type: "add",
        task: {
          id: `temp-${crypto.randomUUID()}`,
          title: input.title,
          done: false,
          doneAt: null,
          createdAt: new Date(),
          ...dueFromInput(input),
        },
      },
      () => createTask(input),
    );

  const handleToggle = (task: TaskView) =>
    run(
      { type: "update", id: task.id, patch: { done: !task.done, doneAt: task.done ? null : new Date() } },
      () => setTaskDone(task.id, !task.done),
    );

  const handleSave = (id: string, input: TaskInput) => {
    setEditing(null);
    run({ type: "update", id, patch: { title: input.title, ...dueFromInput(input) } }, () => updateTask(id, input));
  };

  const handleDelete = (id: string) => {
    setEditing(null);
    run({ type: "delete", id }, () => deleteTask(id));
  };

  const renderItems = (list: TaskView[]) =>
    list.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        todayKey={todayKey}
        onToggle={handleToggle}
        onEdit={(t) => !t.id.startsWith("temp-") && setEditing(t)}
      />
    ));

  return (
    <>
      <QuickAddTask onAdd={handleAdd} />

      {optimisticTasks.length === 0 && (
        <EmptyState icon={<ChecklistIcon />}>Aucune tâche pour l&apos;instant. Ajoute la première ci-dessus.</EmptyState>
      )}

      <TaskSection title="Aujourd'hui" count={today.length}>
        {renderItems(today)}
      </TaskSection>
      <TaskSection title="À venir" count={upcoming.length}>
        {renderItems(upcoming)}
      </TaskSection>
      <TaskSection title="Sans date" count={undated.length}>
        {renderItems(undated)}
      </TaskSection>
      <TaskSection title="Terminées" count={done.length} collapsible defaultOpen={false}>
        {renderItems(done)}
      </TaskSection>

      <TaskEditSheet task={editing} onClose={() => setEditing(null)} onSave={handleSave} onDelete={handleDelete} />
    </>
  );
}
