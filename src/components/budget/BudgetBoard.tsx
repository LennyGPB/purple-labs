"use client";

import { startTransition, useState, type ReactNode } from "react";
import { uncheckAllBudget } from "@/actions/budget";
import { createPurchase, deletePurchase, setPurchaseActive, updatePurchase } from "@/actions/purchases";
import { createSalary, deleteSalary, setSalaryActive, updateSalary } from "@/actions/salaries";
import {
  createSubscription,
  deleteSubscription,
  setSubscriptionActive,
  updateSubscription,
} from "@/actions/subscriptions";
import { BagIcon, BanknoteIcon, CardIcon, PlusIcon } from "@/components/icons";
import { PriceItemSheet, type PriceItemSheetTarget } from "@/components/price-list/PriceItemSheet";
import { PriceList } from "@/components/price-list/PriceList";
import type { PriceItem, PriceListLabels } from "@/components/price-list/types";
import { usePriceList } from "@/components/price-list/usePriceList";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { formatEuros } from "@/lib/money";

type Tab = "abonnements" | "achats" | "salaire";

const tabOrder: Tab[] = ["abonnements", "achats", "salaire"];

const tabs: Record<Tab, { label: string; icon: ReactNode; labels: PriceListLabels }> = {
  abonnements: {
    label: "Abonnements",
    icon: <CardIcon />,
    labels: {
      emptyText: "Aucun abonnement. Ajoute le premier.",
      newItem: "Nouvel abonnement",
      editItem: "Modifier l'abonnement",
      titlePlaceholder: "Netflix, Spotify…",
      amountLabel: "Prix (€)",
      checkLabel: "Retirer du total",
      countWord: "compté",
    },
  },
  achats: {
    label: "Achats",
    icon: <BagIcon />,
    labels: {
      emptyText: "Rien à acheter. Ajoute un premier article.",
      newItem: "Nouvel article",
      editItem: "Modifier l'article",
      titlePlaceholder: "Casque, chaussures…",
      amountLabel: "Prix (€)",
      checkLabel: "Compter dans le total",
      countWord: "compté",
    },
  },
  salaire: {
    label: "Salaire",
    icon: <BanknoteIcon />,
    labels: {
      emptyText: "Aucun salaire. Ajoute un premier revenu.",
      newItem: "Nouveau salaire",
      editItem: "Modifier le salaire",
      titlePlaceholder: "Salaire octobre, prime…",
      amountLabel: "Montant (€)",
      checkLabel: "Marquer comme reçu",
      countWord: "reçu",
    },
  },
};

const subscriptionActions = {
  create: createSubscription,
  update: updateSubscription,
  setActive: setSubscriptionActive,
  remove: deleteSubscription,
};

const purchaseActions = {
  create: createPurchase,
  update: updatePurchase,
  setActive: setPurchaseActive,
  remove: deletePurchase,
};

const salaryActions = {
  create: createSalary,
  update: updateSalary,
  setActive: setSalaryActive,
  remove: deleteSalary,
};

type BudgetBoardProps = { subscriptions: PriceItem[]; purchases: PriceItem[]; salaries: PriceItem[] };

/**
 * Budget : abonnements, achats et salaire.
 * Total général = salaires reçus − (abonnements comptés + achats comptés) :
 * positif (vert) = il reste de l'argent, négatif (rouge, avec « - ») = déficit.
 */
export function BudgetBoard({ subscriptions, purchases, salaries }: BudgetBoardProps) {
  const [tab, setTab] = useState<Tab>("abonnements");
  const [target, setTarget] = useState<PriceItemSheetTarget>(null);
  const lists = {
    abonnements: usePriceList(subscriptions, subscriptionActions, "excluded"),
    achats: usePriceList(purchases, purchaseActions, "counted"),
    salaire: usePriceList(salaries, salaryActions, "counted"),
  };
  const current = lists[tab];
  const config = tabs[tab];

  const expensesCents = lists.abonnements.totalCents + lists.achats.totalCents;
  const totalCents = lists.salaire.totalCents - expensesCents;
  const checkedCount = tabOrder.reduce((sum, t) => sum + lists[t].checkedCount, 0);

  function uncheckAll() {
    startTransition(async () => {
      for (const t of tabOrder) lists[t].applyUncheckAll();
      await uncheckAllBudget();
    });
  }

  return (
    <>
      <PageHeader
        title="Budget"
        action={
          <Button onClick={() => setTarget("new")}>
            <PlusIcon className="size-4" />
            Ajouter
          </Button>
        }
      />

      <SegmentedControl
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={tabOrder.map((t) => ({ value: t, label: tabs[t].label }))}
      />

      {/* Total de l'onglet affiché */}
      <div key={`total-${tab}`} className="glass-frost mb-4 flex animate-fade-in items-end justify-between gap-4 rounded-2xl px-5 py-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Total {config.label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-white">
            {formatEuros(current.totalCents)}
          </p>
        </div>
        <p className="pb-1 text-xs text-zinc-500 tabular-nums">
          {current.activeCount} / {current.list.length} {config.labels.countWord}
          {current.activeCount > 1 ? "s" : ""}
        </p>
      </div>

      <PriceList
        key={tab}
        items={current.list}
        isChecked={current.isChecked}
        checkLabel={config.labels.checkLabel}
        emptyText={config.labels.emptyText}
        emptyIcon={config.icon}
        onToggle={current.toggle}
        onOpen={setTarget}
      />

      {/* Espace réservé sous la liste pour la barre de total fixe */}
      <div className="h-32 md:h-28" />

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-20 px-3 md:bottom-6 md:left-68 md:px-0">
        <div className="pointer-events-auto mx-auto max-w-3xl md:px-8">
          <div className="glass-frost flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Total</p>
              <p
                className={cn(
                  "text-2xl font-semibold tracking-tight tabular-nums",
                  totalCents < 0 ? "text-rose-400" : totalCents > 0 ? "text-emerald-400" : "text-white",
                )}
              >
                {formatEuros(totalCents)}
              </p>
              <p className="text-xs text-zinc-500 tabular-nums">
                Dépenses {formatEuros(expensesCents)} · Reçu {formatEuros(lists.salaire.totalCents)}
              </p>
            </div>
            <Button variant="ghost" disabled={checkedCount === 0} onClick={uncheckAll} className="shrink-0">
              Tout décocher
            </Button>
          </div>
        </div>
      </div>

      <PriceItemSheet
        target={target}
        labels={config.labels}
        onClose={() => setTarget(null)}
        onSave={(id, input) => {
          setTarget(null);
          current.save(id, input);
        }}
        onDelete={(id) => {
          setTarget(null);
          current.remove(id);
        }}
      />
    </>
  );
}
