"use client";

import { FolderIcon } from "@/components/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { APP_TIMEZONE } from "@/lib/dates";
import type { NoteView } from "./types";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: APP_TIMEZONE, day: "numeric", month: "short" });

type NoteCardProps = {
  note: NoteView;
  folderName?: string;
  onOpen: (note: NoteView) => void;
};

export function NoteCard({ note, folderName, onOpen }: NoteCardProps) {
  return (
    <button type="button" onClick={() => onOpen(note)} className="animate-fade-in text-left">
      <GlassCard className="flex h-full flex-col gap-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.09] active:scale-[0.98]">
        <h3 className="line-clamp-2 font-medium text-white">{note.title}</h3>
        {note.content && (
          <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-line text-zinc-400">{note.content}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
          <span>{dateFormatter.format(note.updatedAt)}</span>
          {folderName && (
            <span className="flex items-center gap-1 truncate">
              <FolderIcon className="size-3" />
              {folderName}
            </span>
          )}
        </div>
      </GlassCard>
    </button>
  );
}
