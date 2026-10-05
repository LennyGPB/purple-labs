"use server";

import { revalidatePath } from "next/cache";
import { toPriceItemData, type PriceItemInput } from "@/lib/price-item";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId } from "@/lib/validation";

export async function createPurchase(input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.purchase.create({ data: toPriceItemData(input) });
  revalidatePath("/achats");
}

export async function updatePurchase(id: string, input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.purchase.update({ where: { id: requireId(id) }, data: toPriceItemData(input) });
  revalidatePath("/achats");
}

export async function setPurchaseActive(id: string, active: boolean): Promise<void> {
  await requireSession();
  await prisma.purchase.update({ where: { id: requireId(id) }, data: { active: Boolean(active) } });
  revalidatePath("/achats");
}

/** « Tout décocher » : case cochée = compté, donc plus aucun article n'est compté. */
export async function uncheckAllPurchases(): Promise<void> {
  await requireSession();
  await prisma.purchase.updateMany({ where: { active: true }, data: { active: false } });
  revalidatePath("/achats");
}

export async function deletePurchase(id: string): Promise<void> {
  await requireSession();
  await prisma.purchase.delete({ where: { id: requireId(id) } });
  revalidatePath("/achats");
}
