import type { Metadata } from "next";
import { TodoBoard } from "@/components/todo/TodoBoard";
import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "TODO · PurpleLabs" };

export default async function TodoPage() {
  await requireSession();
  const [tasks, categories] = await Promise.all([
    prisma.task.findMany({
      select: {
        id: true,
        title: true,
        done: true,
        dueAt: true,
        hasTime: true,
        doneAt: true,
        createdAt: true,
        categoryId: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.taskCategory.findMany({
      select: { id: true, name: true },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <>
      <PageHeader title="TODO" />
      <TodoBoard tasks={tasks} categories={categories} />
    </>
  );
}
