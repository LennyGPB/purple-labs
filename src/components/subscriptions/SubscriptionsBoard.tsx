"use client";

import { startTransition, useOptimistic, useState } from "react";
import {
  createSubscription,
  deleteSubscription,
  setSubscriptionActive,
  uncheckAllSubscriptions,
  updateSubscription,
  type SubscriptionInput,
} from "@/actions/subscriptions";
import { CardIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { formatEuros } from "@/lib/money";
import { SubscriptionSheet, type SubscriptionSheetTarget } from "./SubscriptionSheet";
import type { SubscriptionView } from "./types";

type OptimisticAction =
  | { type: "upsert"; subscription: SubscriptionView }
  | { type: "setActive"; id: string; active: boolean }
  | { type: "uncheckAll" }
  | { type: "delete"; id: string };

function reducer(list: SubscriptionView[], action: OptimisticAction): SubscriptionView[] {
  switch (action.type) {
    case "upsert": {
      const exists = list.some((s) => s.id === action.subscription.id);
      return exists
        ? list.map((s) => (s.id === action.subscription.id ? action.subscription : s))
        : [...list, action.subscription];
    }
    case "setActive":
      return list.map((s) => (s.id === action.id ? { ...s, active: action.active } : s));
    case "uncheckAll":
      return list.map((s) => ({ ...s, active: true }));
    case "delete":
      return list.filter((s) => s.id !== action.id);
  }
}

export function SubscriptionsBoard({ subscriptions }: { subscriptions: SubscriptionView[] }) {
  const [list, apply] = useOptimistic(subscriptions, reducer);
  const [target, setTarget] = useState<SubscriptionSheetTarget>(null);

  // Case cochée = abonnement retiré du total (active = false).
  const checkedCount = list.filter((s) => !s.active).length;
  const totalCents = list.reduce((sum, s) => (s.active ? sum + s.priceCents : sum), 0);

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  function save(id: string | null, input: SubscriptionInput) {
    setTarget(null);
    const existing = list.find((s) => s.id === id);
    const subscription: SubscriptionView = {
      id: id ?? `temp-${crypto.randomUUID()}`,
      active: existing?.active ?? true,
      ...input,
    };
    run({ type: "upsert", subscription }, () => (id ? updateSubscription(id, input) : createSubscription(input)));
  }

  function remove(id: string) {
    setTarget(null);
    run({ type: "delete", id }, () => deleteSubscription(id));
  }

  return (
    <>
      <PageHeader
        title="Abonnements"
        action={
          <Button onClick={() => setTarget("new")}>
            <PlusIcon className="size-4" />
            Ajouter
          </Button>
        }
      />

      <div className="glass-frost sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 mb-5 flex items-center justify-between gap-4 rounded-2xl p-5 md:top-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Total</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-white">{formatEuros(totalCents)}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {checkedCount} / {list.length} retiré{checkedCount > 1 ? "s" : ""} du total
          </p>
        </div>
        <Button
          variant="ghost"
          disabled={checkedCount === 0}
          onClick={() => run({ type: "uncheckAll" }, uncheckAllSubscriptions)}
        >
          Tout décocher
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<CardIcon />}>Aucun abonnement. Ajoute le premier.</EmptyState>
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {list.map((s) => (
              <li key={s.id} className="flex animate-fade-in items-center gap-3 px-4 py-3.5">
                <Checkbox
                  checked={!s.active}
                  label={`Retirer « ${s.title} » du total`}
                  onChange={(checked) =>
                    run({ type: "setActive", id: s.id, active: !checked }, () => setSubscriptionActive(s.id, !checked))
                  }
                />
                <button
                  type="button"
                  onClick={() => !s.id.startsWith("temp-") && setTarget(s)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <span
                    className={cn(
                      "truncate text-[15px] transition-colors duration-200",
                      s.active ? "text-white" : "text-zinc-500",
                    )}
                  >
                    {s.title}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm tabular-nums transition-colors duration-200",
                      s.active ? "text-zinc-200" : "text-zinc-600 line-through",
                    )}
                  >
                    {formatEuros(s.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <SubscriptionSheet target={target} onClose={() => setTarget(null)} onSave={save} onDelete={remove} />
    </>
  );
}
