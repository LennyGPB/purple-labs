import type { Metadata } from "next";
import { createPurchase, deletePurchase, setPurchaseActive, uncheckAllPurchases, updatePurchase } from "@/actions/purchases";
import { BagIcon } from "@/components/icons";
import { PriceListBoard } from "@/components/price-list/PriceListBoard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Achats · PurpleLabs" };

export default async function PurchasesPage() {
  await requireSession();
  const purchases = await prisma.purchase.findMany({
    select: { id: true, title: true, priceCents: true, active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <PriceListBoard
      items={purchases}
      checkedMeans="counted"
      emptyIcon={<BagIcon />}
      labels={{
        title: "Achats",
        emptyText: "Rien à acheter. Ajoute un premier article.",
        newItem: "Nouvel article",
        editItem: "Modifier l'article",
        titlePlaceholder: "Casque, chaussures…",
      }}
      actions={{
        create: createPurchase,
        update: updatePurchase,
        setActive: setPurchaseActive,
        uncheckAll: uncheckAllPurchases,
        remove: deletePurchase,
      }}
    />
  );
}
