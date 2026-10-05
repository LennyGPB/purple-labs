"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireId, requireText } from "@/lib/validation";

export type SubscriptionInput = {
  title: string;
  priceCents: number;
};

function toSubscriptionData(input: SubscriptionInput) {
  const { priceCents } = input;
  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 100_000_000) {
    throw new Error("Prix invalide");
  }
  return { title: requireText(input.title, "Titre", 120), priceCents };
}

export async function createSubscription(input: SubscriptionInput): Promise<void> {
  await requireSession();
  await prisma.subscription.create({ data: toSubscriptionData(input) });
  revalidatePath("/abonnements");
}

export async function updateSubscription(id: string, input: SubscriptionInput): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: toSubscriptionData(input) });
  revalidatePath("/abonnements");
}

export async function setSubscriptionActive(id: string, active: boolean): Promise<void> {
  await requireSession();
  await prisma.subscription.update({ where: { id: requireId(id) }, data: { active: Boolean(active) } });
  revalidatePath("/abonnements");
}

/** « Tout décocher » : tous les abonnements sont de nouveau comptés dans le total. */
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
