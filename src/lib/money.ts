const euroFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatEuros(cents: number): string {
  return euroFormatter.format(cents / 100);
}

/** "9,99" / "9.99" / "10" → 999. Retourne null si la saisie est invalide. */
export function parseEurosToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

/** 999 → "9,99" pour pré-remplir un champ. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
