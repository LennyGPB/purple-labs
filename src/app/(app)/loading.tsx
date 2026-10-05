import { GlassCard } from "@/components/ui/GlassCard";

/** Squelette de chargement, révélé seulement si le chargement dépasse ~350 ms (pas de flash). */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement" className="animate-fade-in-delayed">
      <div className="mb-5 h-9 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
      <GlassCard className="mb-6 h-15 animate-pulse" />
      <GlassCard className="divide-y divide-white/5 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <div className="size-6 shrink-0 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="h-4 flex-1 animate-pulse rounded-md bg-white/[0.07]" style={{ maxWidth: `${70 - i * 12}%` }} />
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
