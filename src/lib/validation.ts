// Validation minimale des entrées des Server Actions (qui sont des endpoints publics).

export function requireText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`${field} invalide`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) throw new Error(`${field} invalide`);
  return trimmed;
}

export function optionalText(value: unknown, field: string, maxLength: number): string {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > maxLength) throw new Error(`${field} invalide`);
  return value;
}

export function requireId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9]{10,40}$/i.test(value)) throw new Error("Identifiant invalide");
  return value;
}

export function optionalId(value: unknown): string | null {
  return value == null || value === "" ? null : requireId(value);
}

export function isDateInput(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTimeInput(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}
