"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

/**
 * « Tout décocher » sur les trois listes :
 * les abonnements sont de nouveau comptés, les achats et salaires ne le sont plus.
 */
export async function uncheckAllBudget(): Promise<void> {
  await requireSession();
  await prisma.$transaction([
    prisma.subscription.updateMany({ where: { active: false }, data: { active: true } }),
    prisma.purchase.updateMany({ where: { active: true }, data: { active: false } }),
    prisma.salary.updateMany({ where: { active: true }, data: { active: false } }),
  ]);
  revalidatePath("/budget");
}
