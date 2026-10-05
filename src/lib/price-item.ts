// Éléments communs aux listes avec prix (Abonnements, Achats).
import { requireText } from "./validation";

export type PriceItemInput = {
  title: string;
  priceCents: number;
};

/** Valide une saisie titre + prix (en centimes) reçue par une Server Action. */
export function toPriceItemData(input: PriceItemInput): PriceItemInput {
  const { priceCents } = input;
  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 100_000_000) {
    throw new Error("Prix invalide");
  }
  return { title: requireText(input.title, "Titre", 120), priceCents };
}
