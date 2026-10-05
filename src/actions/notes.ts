"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { optionalId, optionalText, requireId, requireText } from "@/lib/validation";

export type NoteInput = {
  title: string;
  content: string;
  folderId: string | null;
};

function toNoteData(input: NoteInput) {
  return {
    title: requireText(input.title, "Titre", 200),
    content: optionalText(input.content, "Contenu", 100_000),
    folderId: optionalId(input.folderId),
  };
}

/** Retourne l'id de la note créée (l'éditeur enchaîne ensuite les mises à jour). */
export async function createNote(input: NoteInput): Promise<string> {
  await requireSession();
  const note = await prisma.note.create({ data: toNoteData(input) });
  revalidatePath("/notes");
  return note.id;
}

export async function updateNote(id: string, input: NoteInput): Promise<void> {
  await requireSession();
  await prisma.note.update({ where: { id: requireId(id) }, data: toNoteData(input) });
  revalidatePath("/notes");
}

export async function deleteNote(id: string): Promise<void> {
  await requireSession();
  await prisma.note.delete({ where: { id: requireId(id) } });
  revalidatePath("/notes");
}

export async function createFolder(name: string): Promise<string> {
  await requireSession();
  const folder = await prisma.folder.create({ data: { name: requireText(name, "Nom", 60) } });
  revalidatePath("/notes");
  return folder.id;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  await requireSession();
  await prisma.folder.update({ where: { id: requireId(id) }, data: { name: requireText(name, "Nom", 60) } });
  revalidatePath("/notes");
}

/** Supprime le dossier ; ses notes passent « Sans dossier ». */
export async function deleteFolder(id: string): Promise<void> {
  await requireSession();
  await prisma.folder.delete({ where: { id: requireId(id) } });
  revalidatePath("/notes");
}
