import type { PriceItemInput } from "@/lib/price-item";

export type PriceItem = {
  id: string;
  title: string;
  priceCents: number;
  /** true = pris en compte dans le total de sa liste */
  active: boolean;
};

/**
 * Sens de la case à cocher :
 * - "excluded" : cochée = retirée du total (abonnements) ;
 * - "counted" : cochée = prise en compte (achats, salaire reçu).
 */
export type CheckedMeans = "excluded" | "counted";

/** Server Actions propres à chaque liste. */
export type PriceListActions = {
  create: (input: PriceItemInput) => Promise<void>;
  update: (id: string, input: PriceItemInput) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
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
  /** Action de la case pour les lecteurs d'écran, ex. « Retirer du total » */
  checkLabel: string;
  /** Mot du compteur au singulier, ex. « compté », « reçu » */
  countWord: string;
};
