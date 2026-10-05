"use client";

import { startTransition, useOptimistic } from "react";
import type { PriceItemInput } from "@/lib/price-item";
import type { CheckedMeans, PriceItem, PriceListActions } from "./types";

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

/** État optimiste d'une liste titre + montant : chaque action s'affiche avant la réponse du serveur. */
export function usePriceList(items: PriceItem[], actions: PriceListActions, checkedMeans: CheckedMeans) {
  const [list, apply] = useOptimistic(items, reducer);
  const countsWhenChecked = checkedMeans === "counted";
  const isChecked = (item: PriceItem) => (countsWhenChecked ? item.active : !item.active);

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  return {
    list,
    isChecked,
    totalCents: list.reduce((sum, i) => (i.active ? sum + i.priceCents : sum), 0),
    activeCount: list.filter((i) => i.active).length,
    checkedCount: list.filter(isChecked).length,

    toggle(item: PriceItem, checked: boolean) {
      const active = countsWhenChecked ? checked : !checked;
      run({ type: "setActive", id: item.id, active }, () => actions.setActive(item.id, active));
    },

    /** Un nouvel élément arrive décoché. */
    save(id: string | null, input: PriceItemInput) {
      const existing = list.find((i) => i.id === id);
      const item: PriceItem = {
        id: id ?? `temp-${crypto.randomUUID()}`,
        active: existing?.active ?? !countsWhenChecked,
        ...input,
      };
      run({ type: "upsert", item }, () => (id ? actions.update(id, input) : actions.create(input)));
    },

    remove(id: string) {
      run({ type: "delete", id }, () => actions.remove(id));
    },

    /** Décoche tout (affichage seulement) : à appeler dans une transition. */
    applyUncheckAll() {
      apply({ type: "setAllActive", active: !countsWhenChecked });
    },
  };
}
