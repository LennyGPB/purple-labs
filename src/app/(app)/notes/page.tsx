import type { Metadata } from "next";
import { NotesBoard } from "@/components/notes/NotesBoard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Notes · PurpleLabs" };

export default async function NotesPage() {
  await requireSession();
  const [notes, folders] = await Promise.all([
    prisma.note.findMany({
      select: { id: true, title: true, content: true, folderId: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.folder.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <NotesBoard notes={notes} folders={folders} />;
}
