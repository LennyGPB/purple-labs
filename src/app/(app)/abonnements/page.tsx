import type { Metadata } from "next";
import { SubscriptionsBoard } from "@/components/subscriptions/SubscriptionsBoard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Abonnements · PurpleLabs" };

export default async function SubscriptionsPage() {
  await requireSession();
  const subscriptions = await prisma.subscription.findMany({
    select: { id: true, title: true, priceCents: true, active: true },
    orderBy: { createdAt: "asc" },
  });

  return <SubscriptionsBoard subscriptions={subscriptions} />;
}
