"use client";

import type { ReactNode } from "react";
import { PencilIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";

export type NamedItem = { id: string; name: string };

/** Filtre actif : tout, éléments sans groupe, ou un groupe précis (id). */
export type Filter = "all" | "none" | string;

/** Revient à « all » si le groupe sélectionné n'existe plus. */
export function resolveFilter(filter: Filter, items: NamedItem[]): Filter {
  return filter === "all" || filter === "none" || items.some((i) => i.id === filter) ? filter : "all";
}

export function matchesFilter(groupId: string | null, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "none") return groupId === null;
  return groupId === filter;
}

/** Id du groupe à pré-sélectionner pour un nouvel élément, selon le filtre actif. */
export function groupFromFilter(filter: Filter): string | null {
  return filter === "all" || filter === "none" ? null : filter;
}

type FilterBarProps = {
  items: NamedItem[];
  selected: Filter;
  /** `none` omis : pas de puce « sans groupe » */
  labels: { all: string; none?: string; create: string; edit: string };
  /** Icône affichée devant chaque groupe */
  icon?: ReactNode;
  onSelect: (filter: Filter) => void;
  onCreate: () => void;
  onEdit: (item: NamedItem) => void;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-all duration-200 active:scale-95",
        active
          ? "border-violet-400/50 bg-white/10 text-white"
          : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

/** Puces de filtre défilantes (Tout / Sans groupe / groupes), avec création et édition de groupe. */
export function FilterBar({ items, selected, labels, icon, onSelect, onCreate, onEdit }: FilterBarProps) {
  const selectedItem = items.find((i) => i.id === selected);

  return (
    <div className="mb-5 flex items-center gap-2">
      <div className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        <Chip active={selected === "all"} onClick={() => onSelect("all")}>
          {labels.all}
        </Chip>
        {labels.none && (
          <Chip active={selected === "none"} onClick={() => onSelect("none")}>
            {labels.none}
          </Chip>
        )}
        {items.map((item) => (
          <Chip key={item.id} active={selected === item.id} onClick={() => onSelect(item.id)}>
            {icon}
            {item.name}
          </Chip>
        ))}
        <button
          type="button"
          onClick={onCreate}
          aria-label={labels.create}
          className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-3 text-sm text-zinc-400 transition-colors hover:bg-white/5"
        >
          <PlusIcon className="size-4" />
          {labels.create}
        </button>
      </div>
      {selectedItem && (
        <IconButton label={labels.edit} onClick={() => onEdit(selectedItem)} className="glass">
          <PencilIcon className="size-4" />
        </IconButton>
      )}
    </div>
  );
}
