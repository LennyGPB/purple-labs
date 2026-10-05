"use client";

import { startTransition, useOptimistic } from "react";
import type { PriceItemInput } from "@/lib/price-item";
import type { PriceItem, PriceListActions } from "./types";

type OptimisticAction =
  | { type: "upsert"; item: PriceItem }
  | { type: "setDone"; id: string; done: boolean }
  | { type: "resetDone" }
  | { type: "delete"; id: string };

function reducer(list: PriceItem[], action: OptimisticAction): PriceItem[] {
  switch (action.type) {
    case "upsert": {
      const exists = list.some((i) => i.id === action.item.id);
      return exists ? list.map((i) => (i.id === action.item.id ? action.item : i)) : [...list, action.item];
    }
    case "setDone":
      return list.map((i) => (i.id === action.id ? { ...i, done: action.done } : i));
    case "resetDone":
      return list.map((i) => ({ ...i, done: false }));
    case "delete":
      return list.filter((i) => i.id !== action.id);
  }
}

/** État optimiste d'une liste titre + montant : chaque action s'affiche avant la réponse du serveur. */
export function usePriceList(items: PriceItem[], actions: PriceListActions) {
  const [list, apply] = useOptimistic(items, reducer);
  const done = list.filter((i) => i.done);

  function run(action: OptimisticAction, mutation: () => Promise<void>) {
    startTransition(async () => {
      apply(action);
      await mutation();
    });
  }

  return {
    list,
    /** Somme de tous les éléments */
    totalCents: list.reduce((sum, i) => sum + i.priceCents, 0),
    /** Somme des éléments cochés (faits) */
    doneCents: done.reduce((sum, i) => sum + i.priceCents, 0),
    doneCount: done.length,

    toggle(item: PriceItem, checked: boolean) {
      run({ type: "setDone", id: item.id, done: checked }, () => actions.setDone(item.id, checked));
    },

    /** Un nouvel élément arrive décoché ; une modification conserve l'état de la case. */
    save(id: string | null, input: PriceItemInput) {
      const existing = list.find((i) => i.id === id);
      const item: PriceItem = { id: id ?? `temp-${crypto.randomUUID()}`, done: existing?.done ?? false, ...input };
      run({ type: "upsert", item }, () => (id ? actions.update(id, input) : actions.create(input)));
    },

    remove(id: string) {
      run({ type: "delete", id }, () => actions.remove(id));
    },

    /** Décoche tout (affichage seulement) : à appeler dans une transition. */
    applyResetDone() {
      apply({ type: "resetDone" });
    },
  };
}
