"use server";

import { revalidatePath } from "next/cache";
import { toPriceItemData, type PriceItemInput } from "@/lib/price-item";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId } from "@/lib/validation";

export async function createSubscription(input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.subscription.create({ data: toPriceItemData(input) });
  revalidatePath("/budget");
}

export async function updateSubscription(id: string, input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: toPriceItemData(input) });
  revalidatePath("/budget");
}

/** done = true : abonnement payé. */
export async function setSubscriptionDone(id: string, done: boolean): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: { done: Boolean(done) } });
  revalidatePath("/budget");
}

export async function deleteSubscription(id: string): Promise<void> {
  await requireSession();
  await prisma.subscription.delete({ where: { id: requireId(id) } });
  revalidatePath("/budget");
}
