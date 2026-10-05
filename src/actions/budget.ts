"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * « Tout décocher » sur les trois listes :
 * abonnements et achats sont de nouveau comptés, les salaires repassent en « non reçu ».
 */
export async function uncheckAllBudget(): Promise<void> {
  await requireSession();
  await prisma.$transaction([
    prisma.subscription.updateMany({ where: { active: false }, data: { active: true } }),
    prisma.purchase.updateMany({ where: { active: false }, data: { active: true } }),
    prisma.salary.updateMany({ where: { active: true }, data: { active: false } }),
  ]);
  revalidatePath("/budget");
}
