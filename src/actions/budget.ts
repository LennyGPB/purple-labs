"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * « Nouveau mois » : abonnements à repayer et salaires à recevoir.
 * Les achats ne sont pas touchés : c'est une liste d'envies, un article acheté reste acheté.
 */
export async function startNewMonth(): Promise<void> {
  await requireSession();
  await prisma.$transaction([
    prisma.subscription.updateMany({ where: { done: true }, data: { done: false } }),
    prisma.salary.updateMany({ where: { done: true }, data: { done: false } }),
  ]);
  revalidatePath("/budget");
}
