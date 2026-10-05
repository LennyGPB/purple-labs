"use client";

import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import { formatEuros } from "@/lib/money";
import type { PriceItem } from "./types";

type PriceListProps = {
  items: PriceItem[];
  checkLabel: string;
  emptyText: string;
  emptyIcon: ReactNode;
  onToggle: (item: PriceItem, checked: boolean) => void;
  onOpen: (item: PriceItem) => void;
};

/** Liste titre + montant. Case cochée = c'est fait ; les éléments faits sont atténués. */
export function PriceList({ items, checkLabel, emptyText, emptyIcon, onToggle, onOpen }: PriceListProps) {
  if (items.length === 0) return <EmptyState icon={emptyIcon}>{emptyText}</EmptyState>;

  return (
    <GlassCard className="animate-fade-in overflow-hidden">
      <ul className="divide-y divide-white/5">
        {items.map((item) => (
          <li key={item.id} className="flex animate-fade-in items-center gap-3 px-4 py-3.5">
            <Checkbox
              checked={item.done}
              label={`${checkLabel} : ${item.title}`}
              onChange={(checked) => onToggle(item, checked)}
            />
            <button
              type="button"
              onClick={() => !item.id.startsWith("temp-") && onOpen(item)}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
            >
              <span
                className={cn(
                  "truncate text-[15px] transition-colors duration-200",
                  item.done ? "text-zinc-400" : "text-white",
                )}
              >
                {item.title}
              </span>
              <span
                className={cn(
                  "shrink-0 text-sm tabular-nums transition-colors duration-200",
                  item.done ? "text-zinc-500" : "text-zinc-200",
                )}
              >
                {formatEuros(item.priceCents)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
