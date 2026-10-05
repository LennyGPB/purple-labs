// Les dates sont stockées en UTC et interprétées dans un fuseau fixe,
// identique côté serveur (Vercel = UTC) et côté client, pour un affichage cohérent.

export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Europe/Paris";

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIMEZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(date: Date): Parts {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((p) => [p.type, Number(p.value)]),
  ) as Record<string, number>;
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** Décalage (ms) entre l'heure locale du fuseau et UTC à un instant donné. */
function offsetAt(timestamp: number): number {
  const p = zonedParts(new Date(timestamp));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(timestamp / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-05" + "14:30" (heure locale du fuseau) → Date UTC. Sans heure : minuit local. */
export function zonedToUtc(date: string, time?: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time ? time.split(":").map(Number) : [0, 0];
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - offsetAt(guess);
  const second = guess - offsetAt(first);
  return new Date(second);
}

/** Date UTC → { date: "YYYY-MM-DD", time: "HH:mm" } dans le fuseau de l'app. */
export function utcToZoned(date: Date): { date: string; time: string } {
  const p = zonedParts(date);
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

/** Clé de jour "YYYY-MM-DD" (comparable lexicographiquement) dans le fuseau de l'app. */
export function dayKey(date: Date): string {
  return utcToZoned(date).date;
}

/** Ajoute n jours à une clé de jour. */
export function shiftDayKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: APP_TIMEZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Libellé court : "Aujourd'hui", "Demain", "Hier" ou "lun. 12 oct.", suivi de l'heure si présente. */
export function formatDue(dueAt: Date, hasTime: boolean, todayKey: string): string {
  const key = dayKey(dueAt);
  let label: string;
  if (key === todayKey) label = "Aujourd'hui";
  else if (key === shiftDayKey(todayKey, 1)) label = "Demain";
  else if (key === shiftDayKey(todayKey, -1)) label = "Hier";
  else label = dayFormatter.format(dueAt);
  return hasTime ? `${label} · ${utcToZoned(dueAt).time}` : label;
}
