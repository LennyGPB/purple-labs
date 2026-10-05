import type { Metadata } from "next";
import { BudgetBoard } from "@/components/budget/BudgetBoard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Budget · PurpleLabs" };

const select = { id: true, title: true, priceCents: true, done: true } as const;

export default async function BudgetPage() {
  await requireSession();
  const [subscriptions, purchases, salaries] = await Promise.all([
    prisma.subscription.findMany({ select, orderBy: { createdAt: "asc" } }),
    prisma.purchase.findMany({ select, orderBy: { createdAt: "asc" } }),
    prisma.salary.findMany({ select, orderBy: { createdAt: "asc" } }),
  ]);

  return <BudgetBoard subscriptions={subscriptions} purchases={purchases} salaries={salaries} />;
}
