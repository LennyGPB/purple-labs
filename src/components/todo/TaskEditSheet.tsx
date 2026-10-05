"use client";

import { useState, type FormEvent } from "react";
import type { TaskInput } from "@/actions/tasks";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Input, Label } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { utcToZoned } from "@/lib/dates";
import { DateTimeFields } from "./DateTimeFields";
import type { TaskView } from "./types";

type TaskEditSheetProps = {
  task: TaskView | null;
  onClose: () => void;
  onSave: (id: string, input: TaskInput) => void;
  onDelete: (id: string) => void;
};

export function TaskEditSheet({ task, onClose, onSave, onDelete }: TaskEditSheetProps) {
  return (
    <Sheet open={task !== null} onClose={onClose} title="Modifier la tâche">
      {task && <TaskEditForm key={task.id} task={task} onSave={onSave} onDelete={onDelete} />}
    </Sheet>
  );
}

function TaskEditForm({ task, onSave, onDelete }: Omit<TaskEditSheetProps, "task" | "onClose"> & { task: TaskView }) {
  const initial = task.dueAt ? utcToZoned(task.dueAt) : null;
  const [title, setTitle] = useState(task.title);
  const [due, setDue] = useState({
    date: initial?.date ?? "",
    time: task.hasTime && initial ? initial.time : "",
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(task.id, { title: title.trim(), date: due.date || null, time: due.time || null });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Label>
        Titre
        <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} required autoFocus />
      </Label>
      <Label as="div">
        Échéance
        <DateTimeFields date={due.date} time={due.time} onChange={setDue} />
      </Label>
      <div className="mt-2 flex gap-2">
        <ConfirmDeleteButton onConfirm={() => onDelete(task.id)} />
        <Button type="submit" className="flex-1" disabled={!title.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
