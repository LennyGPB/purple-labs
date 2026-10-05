"use client";

import { startTransition, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { createTaskCategory, deleteTaskCategory, renameTaskCategory } from "@/actions/taskCategories";
import { createTask, deleteTask, setTaskDone, updateTask, type TaskInput } from "@/actions/tasks";
import { ChecklistIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FilterBar,
  groupFromFilter,
  matchesFilter,
  resolveFilter,
  type Filter,
  type NamedItem,
} from "@/components/ui/FilterBar";
import { NamedItemSheet, type NamedItemSheetTarget } from "@/components/ui/NamedItemSheet";
import { UndoToast } from "@/components/ui/UndoToast";
import { dayKey, zonedToUtc } from "@/lib/dates";
import { QuickAddTask } from "./QuickAddTask";
import { TaskEditSheet } from "./TaskEditSheet";
import { TaskItem } from "./TaskItem";
import { TaskSection } from "./TaskSection";
import type { TaskView } from "./types";

/** Délai pendant lequel une suppression peut être annulée. */
const UNDO_DELAY = 4000;

type OptimisticAction = { type: "add"; task: TaskView } | { type: "update"; id: string; patch: Partial<TaskView> };

function reducer(tasks: TaskView[], action: OptimisticAction): TaskView[] {
  switch (action.type) {
    case "add":
      return [action.task, ...tasks];
    case "update":
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
  }
}

/** Calcule localement l'échéance pour l'affichage optimiste. */
function dueFromInput(input: TaskInput): Pick<TaskView, "dueAt" | "hasTime"> {
  if (!input.date) return { dueAt: null, hasTime: false };
  return { dueAt: zonedToUtc(input.date, input.time ?? undefined), hasTime: Boolean(input.time) };
}

type DatedTask = TaskView & { dueAt: Date };

const byDue = (a: DatedTask, b: DatedTask) => a.dueAt.getTime() - b.dueAt.getTime();

export function TodoBoard({ tasks, categories }: { tasks: TaskView[]; categories: NamedItem[] }) {
  const [optimisticTasks, apply] = useOptimistic(tasks, reducer);
  const [editing, setEditing] = useState<TaskView | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryTarget, setCategoryTarget] = useState<NamedItemSheetTarget>(null);
  const [categoryPending, startCategoryTransition] = useTransition();
  // Suppressions en attente : masquées tout de suite, envoyées au serveur après UNDO_DELAY.
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const [undo, setUndo] = useState<{ id: string; title: string } | null>(null);
  const deleteTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const todayKey = dayKey(new Date());

  // En quittant la page, les suppressions en attente sont envoyées immédiatement.
  useEffect(() => {
    const timers = deleteTimers.current;
    return () => {
      for (const [id, timer] of timers) {
        clearTimeout(timer);
        void deleteTask(id);
      }
    };
  }, []);

  const activeFilter = resolveFilter(filter, categories);
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const visible = optimisticTasks.filter((t) => !hiddenIds.has(t.id) && matchesFilter(t.categoryId, activeFilter));

  const pending = visible.filter((t) => !t.done);
  const dated = pending.filter((t): t is DatedTask => t.dueAt !== null);
  const today = dated.filter((t) => dayKey(t.dueAt) <= todayKey).sort(byDue);
  const upcoming = dated.filter((t) => dayKey(t.dueAt) > todayKey).sort(byDue);
  const undated = pending.filter((t) => t.dueAt === null);
  const done = visible
    .filter((t) => t.done)
    .sort((a, b) => (b.doneAt?.getTime() ?? 0) - (a.doneAt?.getTime() ?? 0));

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  // Une tâche créée pendant un filtre sur une catégorie lui est rattachée.
  const handleAdd = (fields: Omit<TaskInput, "categoryId">) => {
    const input: TaskInput = { ...fields, categoryId: groupFromFilter(activeFilter) };
    run(
      {
        type: "add",
        task: {
          id: `temp-${crypto.randomUUID()}`,
          title: input.title,
          done: false,
          doneAt: null,
          createdAt: new Date(),
          categoryId: input.categoryId,
          ...dueFromInput(input),
        },
      },
      () => createTask(input),
    );
  };

  const handleToggle = (task: TaskView) =>
    run(
      { type: "update", id: task.id, patch: { done: !task.done, doneAt: task.done ? null : new Date() } },
      () => setTaskDone(task.id, !task.done),
    );

  const handleSave = (id: string, input: TaskInput) => {
    setEditing(null);
    run({ type: "update", id, patch: { title: input.title, categoryId: input.categoryId, ...dueFromInput(input) } }, () => updateTask(id, input));
  };

  function commitDelete(id: string) {
    deleteTimers.current.delete(id);
    setUndo((current) => (current?.id === id ? null : current));
    startTransition(async () => {
      await deleteTask(id);
    });
  }

  const handleDelete = (id: string) => {
    setEditing(null);
    const task = optimisticTasks.find((t) => t.id === id);
    if (!task || id.startsWith("temp-")) return;
    setHiddenIds((ids) => new Set(ids).add(id));
    setUndo({ id, title: task.title });
    deleteTimers.current.set(
      id,
      setTimeout(() => commitDelete(id), UNDO_DELAY),
    );
  };

  function undoDelete() {
    if (!undo) return;
    clearTimeout(deleteTimers.current.get(undo.id));
    deleteTimers.current.delete(undo.id);
    setHiddenIds((ids) => {
      const next = new Set(ids);
      next.delete(undo.id);
      return next;
    });
    setUndo(null);
  }

  function submitCategory(name: string) {
    const target = categoryTarget;
    startCategoryTransition(async () => {
      if (target === "new") setFilter(await createTaskCategory(name));
      else if (target) await renameTaskCategory(target.id, name);
      setCategoryTarget(null);
    });
  }

  function removeCategory(category: NamedItem) {
    startCategoryTransition(async () => {
      await deleteTaskCategory(category.id);
      setFilter("all");
      setCategoryTarget(null);
    });
  }

  const renderItems = (list: TaskView[]) =>
    list.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        todayKey={todayKey}
        categoryName={activeFilter === "all" && task.categoryId ? categoryNames.get(task.categoryId) : undefined}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={(t) => !t.id.startsWith("temp-") && setEditing(t)}
      />
    ));

  return (
    <>
      <FilterBar
        items={categories}
        selected={activeFilter}
        labels={{ all: "Toutes", create: "Catégorie", edit: "Modifier la catégorie" }}
        onSelect={setFilter}
        onCreate={() => setCategoryTarget("new")}
        onEdit={setCategoryTarget}
      />

      <QuickAddTask onAdd={handleAdd} />

      {visible.length === 0 && (
        <EmptyState icon={<ChecklistIcon />}>
          {optimisticTasks.length === 0
            ? "Aucune tâche pour l'instant. Ajoute la première ci-dessus."
            : "Aucune tâche dans cette catégorie."}
        </EmptyState>
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

      <TaskEditSheet
        task={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <UndoToast message={undo ? `« ${undo.title} » supprimée` : null} onUndo={undoDelete} />
      <NamedItemSheet
        target={categoryTarget}
        labels={{
          newTitle: "Nouvelle catégorie",
          editTitle: "Modifier la catégorie",
          deleteHint: "Supprimer la catégorie conserve ses tâches (sans catégorie).",
        }}
        pending={categoryPending}
        onClose={() => setCategoryTarget(null)}
        onSubmit={submitCategory}
        onDelete={removeCategory}
      />
    </>
  );
}
