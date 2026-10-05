import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

export function EmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <GlassCard className="flex animate-fade-in flex-col items-center gap-3 px-6 py-10 text-center text-sm text-zinc-400">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-violet-400">{icon}</div>
      {children}
    </GlassCard>
  );
}
