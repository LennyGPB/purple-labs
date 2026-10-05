"use server";

import { revalidatePath } from "next/cache";
import { toPriceItemData, type PriceItemInput } from "@/lib/price-item";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId } from "@/lib/validation";

export async function createPurchase(input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.purchase.create({ data: toPriceItemData(input) });
  revalidatePath("/budget");
}

export async function updatePurchase(id: string, input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.purchase.update({ where: { id: requireId(id) }, data: toPriceItemData(input) });
  revalidatePath("/budget");
}

/** done = true : article acheté, il compte alors dans le budget. */
export async function setPurchaseDone(id: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.purchase.update({ where: { id: requireId(id) }, data: { done: Boolean(done) } });
  revalidatePath("/budget");
}

export async function deletePurchase(id: string): Promise<void> {
  await requireSession();
  await prisma.purchase.delete({ where: { id: requireId(id) } });
  revalidatePath("/budget");
}
