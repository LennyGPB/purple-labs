"use client";

import { startTransition, useState, type ReactNode } from "react";
import { startNewMonth } from "@/actions/budget";
import { createPurchase, deletePurchase, setPurchaseDone, updatePurchase } from "@/actions/purchases";
import { createSalary, deleteSalary, setSalaryDone, updateSalary } from "@/actions/salaries";
import {
  createSubscription,
  deleteSubscription,
  setSubscriptionDone,
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
      checkLabel: "Marquer comme payé",
    },
  },
  achats: {
    label: "Achats",
    icon: <BagIcon />,
    labels: {
      emptyText: "Liste d'envies vide. Ajoute un premier article.",
      newItem: "Nouvel article",
      editItem: "Modifier l'article",
      titlePlaceholder: "Casque, chaussures…",
      amountLabel: "Prix (€)",
      checkLabel: "Marquer comme acheté",
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
    },
  },
};

const subscriptionActions = {
  create: createSubscription,
  update: updateSubscription,
  setDone: setSubscriptionDone,
  remove: deleteSubscription,
};

const purchaseActions = {
  create: createPurchase,
  update: updatePurchase,
  setDone: setPurchaseDone,
  remove: deletePurchase,
};

const salaryActions = {
  create: createSalary,
  update: updateSalary,
  setDone: setSalaryDone,
  remove: deleteSalary,
};

/** Vert si positif, rouge (avec « - ») si négatif. */
function balanceColor(cents: number) {
  return cents < 0 ? "text-rose-400" : cents > 0 ? "text-emerald-400" : "text-white";
}

type ProgressCardProps = { title: string; amountCents: number; detail: string; progress?: number };

/** Carte d'avancement en haut de chaque onglet. */
function ProgressCard({ title, amountCents, detail, progress }: ProgressCardProps) {
  return (
    <div className="glass-frost mb-4 animate-fade-in rounded-2xl px-5 py-4">
      <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">{title}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-white">{formatEuros(amountCents)}</p>
      <p className="mt-1 text-xs text-zinc-500 tabular-nums">{detail}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

type BudgetBoardProps = { subscriptions: PriceItem[]; purchases: PriceItem[]; salaries: PriceItem[] };

/**
 * Budget du mois. Case cochée = c'est fait (abonnement payé, achat acheté, salaire reçu).
 * - Solde prévu = salaires − abonnements − achats cochés (les achats non cochés sont de simples envies).
 * - Disponible maintenant = salaires reçus − abonnements payés − achats cochés.
 */
export function BudgetBoard({ subscriptions, purchases, salaries }: BudgetBoardProps) {
  const [tab, setTab] = useState<Tab>("abonnements");
  const [target, setTarget] = useState<PriceItemSheetTarget>(null);
  const [confirmNewMonth, setConfirmNewMonth] = useState(false);
  const lists = {
    abonnements: usePriceList(subscriptions, subscriptionActions),
    achats: usePriceList(purchases, purchaseActions),
    salaire: usePriceList(salaries, salaryActions),
  };
  const { abonnements: subs, achats, salaire } = lists;
  const current = lists[tab];
  const config = tabs[tab];

  const plannedCents = salaire.totalCents - subs.totalCents - achats.doneCents;
  const availableCents = salaire.doneCents - subs.doneCents - achats.doneCents;
  const canStartNewMonth = subs.doneCount + salaire.doneCount > 0;

  const progressOf = (doneCents: number, totalCents: number) => (totalCents > 0 ? doneCents / totalCents : 0);

  const cards: Record<Tab, ProgressCardProps> = {
    abonnements: {
      title: "Reste à payer",
      amountCents: subs.totalCents - subs.doneCents,
      detail: `Payé ${formatEuros(subs.doneCents)} sur ${formatEuros(subs.totalCents)}`,
      progress: progressOf(subs.doneCents, subs.totalCents),
    },
    achats: {
      title: "Achetés",
      amountCents: achats.doneCents,
      detail: `${achats.doneCount} / ${achats.list.length} acheté${achats.doneCount > 1 ? "s" : ""} · Envies restantes ${formatEuros(achats.totalCents - achats.doneCents)}`,
    },
    salaire: {
      title: "Reste à recevoir",
      amountCents: salaire.totalCents - salaire.doneCents,
      detail: `Reçu ${formatEuros(salaire.doneCents)} sur ${formatEuros(salaire.totalCents)}`,
      progress: progressOf(salaire.doneCents, salaire.totalCents),
    },
  };

  function newMonth() {
    if (!confirmNewMonth) {
      setConfirmNewMonth(true);
      return;
    }
    setConfirmNewMonth(false);
    startTransition(async () => {
      subs.applyResetDone();
      salaire.applyResetDone();
      await startNewMonth();
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

      <ProgressCard key={`card-${tab}`} {...cards[tab]} />

      <PriceList
        key={tab}
        items={current.list}
        checkLabel={config.labels.checkLabel}
        emptyText={config.labels.emptyText}
        emptyIcon={config.icon}
        onToggle={current.toggle}
        onOpen={setTarget}
      />

      {/* Espace réservé sous la liste pour la barre de solde fixe */}
      <div className="h-36 md:h-32" />

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-20 px-3 md:bottom-6 md:left-68 md:px-0">
        <div className="pointer-events-auto mx-auto max-w-3xl md:px-8">
          <div className="glass-frost flex items-center gap-4 rounded-2xl px-5 py-3.5">
            <dl className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Solde prévu</dt>
                <dd className={cn("text-lg font-semibold tabular-nums", balanceColor(plannedCents))}>
                  {formatEuros(plannedCents)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Disponible</dt>
                <dd className={cn("text-lg font-semibold tabular-nums", balanceColor(availableCents))}>
                  {formatEuros(availableCents)}
                </dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              disabled={!canStartNewMonth}
              onClick={newMonth}
              onBlur={() => setConfirmNewMonth(false)}
              className="shrink-0"
            >
              {confirmNewMonth ? "Confirmer ?" : "Nouveau mois"}
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
