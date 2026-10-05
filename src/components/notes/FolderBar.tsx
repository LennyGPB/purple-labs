"use client";

import type { ReactNode } from "react";
import { FolderIcon, PencilIcon, PlusIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { FolderFilter, FolderView } from "./types";

type FolderBarProps = {
  folders: FolderView[];
  selected: FolderFilter;
  onSelect: (filter: FolderFilter) => void;
  onCreate: () => void;
  onEdit: (folder: FolderView) => void;
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

export function FolderBar({ folders, selected, onSelect, onCreate, onEdit }: FolderBarProps) {
  const selectedFolder = folders.find((f) => f.id === selected);

  return (
    <div className="mb-5 flex items-center gap-2">
      <div className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        <Chip active={selected === "all"} onClick={() => onSelect("all")}>
          Toutes
        </Chip>
        <Chip active={selected === "none"} onClick={() => onSelect("none")}>
          Sans dossier
        </Chip>
        {folders.map((folder) => (
          <Chip key={folder.id} active={selected === folder.id} onClick={() => onSelect(folder.id)}>
            <FolderIcon className="size-4" />
            {folder.name}
          </Chip>
        ))}
        <button
          type="button"
          onClick={onCreate}
          aria-label="Nouveau dossier"
          className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-3 text-sm text-zinc-400 transition-colors hover:bg-white/5"
        >
          <PlusIcon className="size-4" />
          Dossier
        </button>
      </div>
      {selectedFolder && (
        <IconButton label="Modifier le dossier" onClick={() => onEdit(selectedFolder)} className="glass">
          <PencilIcon className="size-4" />
        </IconButton>
      )}
    </div>
  );
}
