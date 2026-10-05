"use client";

import { startTransition, useOptimistic, useState, type ReactNode } from "react";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { formatEuros } from "@/lib/money";
import type { PriceItemInput } from "@/lib/price-item";
import { PriceItemSheet, type PriceItemSheetTarget } from "./PriceItemSheet";
import type { CheckedMeans, PriceItem, PriceListActions, PriceListLabels } from "./types";

type OptimisticAction =
  | { type: "upsert"; item: PriceItem }
  | { type: "setActive"; id: string; active: boolean }
  | { type: "setAllActive"; active: boolean }
  | { type: "delete"; id: string };

function reducer(list: PriceItem[], action: OptimisticAction): PriceItem[] {
  switch (action.type) {
    case "upsert": {
      const exists = list.some((i) => i.id === action.item.id);
      return exists ? list.map((i) => (i.id === action.item.id ? action.item : i)) : [...list, action.item];
    }
    case "setActive":
      return list.map((i) => (i.id === action.id ? { ...i, active: action.active } : i));
    case "setAllActive":
      return list.map((i) => ({ ...i, active: action.active }));
    case "delete":
      return list.filter((i) => i.id !== action.id);
  }
}

type PriceListBoardProps = {
  items: PriceItem[];
  actions: PriceListActions;
  labels: PriceListLabels;
  checkedMeans: CheckedMeans;
  emptyIcon: ReactNode;
};

/** Liste titre + prix avec total en temps réel. Partagée par Abonnements et Achats. */
export function PriceListBoard({ items, actions, labels, checkedMeans, emptyIcon }: PriceListBoardProps) {
  const [list, apply] = useOptimistic(items, reducer);
  const [target, setTarget] = useState<PriceItemSheetTarget>(null);

  const countsWhenChecked = checkedMeans === "counted";
  const isChecked = (item: PriceItem) => (countsWhenChecked ? item.active : !item.active);
  const checkedCount = list.filter(isChecked).length;
  const totalCents = list.reduce((sum, i) => (i.active ? sum + i.priceCents : sum), 0);

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  function toggle(item: PriceItem, checked: boolean) {
    const active = countsWhenChecked ? checked : !checked;
    run({ type: "setActive", id: item.id, active }, () => actions.setActive(item.id, active));
  }

  function save(id: string | null, input: PriceItemInput) {
    setTarget(null);
    const existing = list.find((i) => i.id === id);
    const item: PriceItem = { id: id ?? `temp-${crypto.randomUUID()}`, active: existing?.active ?? true, ...input };
    run({ type: "upsert", item }, () => (id ? actions.update(id, input) : actions.create(input)));
  }

  function remove(id: string) {
    setTarget(null);
    run({ type: "delete", id }, () => actions.remove(id));
  }

  return (
    <>
      <PageHeader
        title={labels.title}
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
            {checkedCount} / {list.length} {countsWhenChecked ? "compté" : "retiré"}
            {checkedCount > 1 ? "s" : ""} {countsWhenChecked ? "dans le" : "du"} total
          </p>
        </div>
        <Button
          variant="ghost"
          disabled={checkedCount === 0}
          onClick={() => run({ type: "setAllActive", active: !countsWhenChecked }, actions.uncheckAll)}
        >
          Tout décocher
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={emptyIcon}>{labels.emptyText}</EmptyState>
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {list.map((item) => (
              <li key={item.id} className="flex animate-fade-in items-center gap-3 px-4 py-3.5">
                <Checkbox
                  checked={isChecked(item)}
                  label={countsWhenChecked ? `Compter « ${item.title} » dans le total` : `Retirer « ${item.title} » du total`}
                  onChange={(checked) => toggle(item, checked)}
                />
                <button
                  type="button"
                  onClick={() => !item.id.startsWith("temp-") && setTarget(item)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <span
                    className={cn(
                      "truncate text-[15px] transition-colors duration-200",
                      item.active ? "text-white" : "text-zinc-500",
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm tabular-nums transition-colors duration-200",
                      item.active ? "text-zinc-200" : "text-zinc-600 line-through",
                    )}
                  >
                    {formatEuros(item.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <PriceItemSheet target={target} labels={labels} onClose={() => setTarget(null)} onSave={save} onDelete={remove} />
    </>
  );
}
