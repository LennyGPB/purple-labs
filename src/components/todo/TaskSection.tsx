"use client";

import { useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

type TaskSectionProps = {
  title: string;
  count: number;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function TaskSection({ title, count, collapsible = false, defaultOpen = true, children }: TaskSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;

  const heading = (
    <>
      <span>{title}</span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-300">{count}</span>
      {collapsible && (
        <ChevronIcon className={cn("ml-auto size-4 transition-transform duration-200", open && "rotate-90")} />
      )}
    </>
  );

  return (
    <section className="mb-6 animate-slide-up">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mb-2 flex w-full items-center gap-2 px-1 text-xs font-semibold tracking-wider text-zinc-400 uppercase"
        >
          {heading}
        </button>
      ) : (
        <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          {heading}
        </h2>
      )}
      {open && (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/5">{children}</ul>
        </GlassCard>
      )}
    </section>
  );
}
