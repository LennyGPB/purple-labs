"use server";

import { revalidatePath } from "next/cache";
import { toPriceItemData, type PriceItemInput } from "@/lib/price-item";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId } from "@/lib/validation";

export async function createSubscription(input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.subscription.create({ data: toPriceItemData(input) });
  revalidatePath("/abonnements");
}

export async function updateSubscription(id: string, input: PriceItemInput): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: toPriceItemData(input) });
  revalidatePath("/abonnements");
}

export async function setSubscriptionActive(id: string, active: boolean): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: { active: Boolean(active) } });
  revalidatePath("/abonnements");
}

/** « Tout décocher » : case cochée = retiré, donc tous les abonnements sont de nouveau comptés. */
export async function uncheckAllSubscriptions(): Promise<void> {
  await requireSession();
  await prisma.subscription.updateMany({ where: { active: false }, data: { active: true } });
  revalidatePath("/abonnements");
}

export async function deleteSubscription(id: string): Promise<void> {
  await requireSession();
  await prisma.subscription.delete({ where: { id: requireId(id) } });
  revalidatePath("/abonnements");
}
