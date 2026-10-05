"use server";

import { revalidatePath } from "next/cache";
import { zonedToUtc } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { isDateInput, isTimeInput, optionalId, requireId, requireText } from "@/lib/validation";

export type TaskInput = {
  title: string;
  /** "YYYY-MM-DD" dans le fuseau de l'app, ou null */
  date: string | null;
  /** "HH:mm" dans le fuseau de l'app, ignorée sans date */
  time: string | null;
  categoryId: string | null;
};

function toTaskData(input: TaskInput) {
  const title = requireText(input.title, "Titre", 300);
  const categoryId = optionalId(input.categoryId);
  if (!isDateInput(input.date)) {
    return { title, categoryId, dueAt: null, hasTime: false };
  }
  const time = isTimeInput(input.time) ? input.time : undefined;
  return { title, categoryId, dueAt: zonedToUtc(input.date, time), hasTime: time !== undefined };
}

/** Réinitialise les rappels si l'échéance change (utile pour les notifications futures). */
const resetReminders = { remindedEveAt: null, remindedDayAt: null };

export async function createTask(input: TaskInput): Promise<void> {
  await requireSession();
  await prisma.task.create({ data: toTaskData(input) });
  revalidatePath("/todo");
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  await requireSession();
  const data = toTaskData(input);
  const current = await prisma.task.findUniqueOrThrow({ where: { id: requireId(id) } });
  const dueChanged =
    current.dueAt?.getTime() !== data.dueAt?.getTime() || current.hasTime !== data.hasTime;
  await prisma.task.update({
    where: { id },
    data: { ...data, ...(dueChanged ? resetReminders : {}) },
  });
  revalidatePath("/todo");
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.task.update({
    where: { id: requireId(id) },
    data: { done: Boolean(done), doneAt: done ? new Date() : null },
  });
  revalidatePath("/todo");
}

export async function deleteTask(id: string): Promise<void> {
  await requireSession();
  await prisma.task.delete({ where: { id: requireId(id) } });
  revalidatePath("/todo");
}
