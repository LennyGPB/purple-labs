"use client";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AppError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <GlassCard className="mt-10 flex animate-fade-in flex-col items-center gap-4 p-8 text-center">
      <p className="text-zinc-200">Une erreur est survenue.</p>
      <Button onClick={() => retry()}>Réessayer</Button>
    </GlassCard>
  );
}
