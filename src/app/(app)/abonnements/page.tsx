import type { Metadata } from "next";
import {
  createSubscription,
  deleteSubscription,
  setSubscriptionActive,
  uncheckAllSubscriptions,
  updateSubscription,
} from "@/actions/subscriptions";
import { CardIcon } from "@/components/icons";
import { PriceListBoard } from "@/components/price-list/PriceListBoard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Abonnements · PurpleLabs" };

export default async function SubscriptionsPage() {
  await requireSession();
  const subscriptions = await prisma.subscription.findMany({
    select: { id: true, title: true, priceCents: true, active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <PriceListBoard
      items={subscriptions}
      checkedMeans="excluded"
      emptyIcon={<CardIcon />}
      labels={{
        title: "Abonnements",
        emptyText: "Aucun abonnement. Ajoute le premier.",
        newItem: "Nouvel abonnement",
        editItem: "Modifier l'abonnement",
        titlePlaceholder: "Netflix, Spotify…",
      }}
      actions={{
        create: createSubscription,
        update: updateSubscription,
        setActive: setSubscriptionActive,
        uncheckAll: uncheckAllSubscriptions,
        remove: deleteSubscription,
      }}
    />
  );
}
