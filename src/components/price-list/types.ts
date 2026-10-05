import type { PriceItemInput } from "@/lib/price-item";

export type PriceItem = {
  id: string;
  title: string;
  priceCents: number;
  /** true = compté dans le total */
  active: boolean;
};

/** Sens de la case à cocher : cochée = comptée dans le total, ou cochée = retirée du total. */
export type CheckedMeans = "counted" | "excluded";

/** Server Actions propres à chaque liste. */
export type PriceListActions = {
  create: (input: PriceItemInput) => Promise<void>;
  update: (id: string, input: PriceItemInput) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
  uncheckAll: () => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export type PriceListLabels = {
  /** Titre de la page */
  title: string;
  emptyText: string;
  /** Titre de la feuille en création, ex. « Nouvel abonnement » */
  newItem: string;
  /** Titre de la feuille en édition, ex. « Modifier l'abonnement » */
  editItem: string;
  titlePlaceholder: string;
};
