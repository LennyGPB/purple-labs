import type { PriceItemInput } from "@/lib/price-item";

export type PriceItem = {
  id: string;
  title: string;
  priceCents: number;
  /** Case cochée = c'est fait (payé, acheté, reçu). */
  done: boolean;
};

/** Server Actions propres à chaque liste. */
export type PriceListActions = {
  create: (input: PriceItemInput) => Promise<void>;
  update: (id: string, input: PriceItemInput) => Promise<void>;
  setDone: (id: string, done: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export type PriceListLabels = {
  emptyText: string;
  /** Titre de la feuille en création, ex. « Nouvel abonnement » */
  newItem: string;
  /** Titre de la feuille en édition, ex. « Modifier l'abonnement » */
  editItem: string;
  titlePlaceholder: string;
  /** Libellé du champ montant, ex. « Prix (€) » */
  amountLabel: string;
  /** Action de la case pour les lecteurs d'écran, ex. « Marquer comme payé » */
  checkLabel: string;
};
