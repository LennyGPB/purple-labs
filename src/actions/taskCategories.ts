"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId, requireText } from "@/lib/validation";

export async function createTaskCategory(name: string): Promise<string> {
  await requireSession();
  const category = await prisma.taskCategory.create({ data: { name: requireText(name, "Nom", 60) } });
  revalidatePath("/todo");
  return category.id;
}

export async function renameTaskCategory(id: string, name: string): Promise<void> {
  await requireSession();
  await prisma.taskCategory.update({ where: { id: requireId(id) }, data: { name: requireText(name, "Nom", 60) } });
  revalidatePath("/todo");
}

/** Supprime la catégorie ; ses tâches passent « Sans catégorie ». */
export async function deleteTaskCategory(id: string): Promise<void> {
  await requireSession();
  await prisma.taskCategory.delete({ where: { id: requireId(id) } });
  revalidatePath("/todo");
}
