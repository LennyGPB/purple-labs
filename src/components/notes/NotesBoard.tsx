"use client";

import { startTransition, useOptimistic, useState, useTransition } from "react";
import {
  createFolder,
  createNote,
  deleteFolder,
  deleteNote,
  renameFolder,
  updateNote,
  type NoteInput,
} from "@/actions/notes";
import { NoteIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { FolderBar } from "./FolderBar";
import { FolderSheet, type FolderSheetTarget } from "./FolderSheet";
import { NoteCard } from "./NoteCard";
import { NoteSheet, type NoteSheetTarget } from "./NoteSheet";
import type { FolderFilter, FolderView, NoteView } from "./types";

type OptimisticAction =
  | { type: "upsert"; note: NoteView }
  | { type: "delete"; id: string };

function reducer(notes: NoteView[], action: OptimisticAction): NoteView[] {
  if (action.type === "delete") return notes.filter((n) => n.id !== action.id);
  const others = notes.filter((n) => n.id !== action.note.id);
  return [action.note, ...others];
}

export function NotesBoard({ notes, folders }: { notes: NoteView[]; folders: FolderView[] }) {
  const [optimisticNotes, apply] = useOptimistic(notes, reducer);
  const [filter, setFilter] = useState<FolderFilter>("all");
  const [noteTarget, setNoteTarget] = useState<NoteSheetTarget>(null);
  const [folderTarget, setFolderTarget] = useState<FolderSheetTarget>(null);
  const [folderPending, startFolderTransition] = useTransition();

  // Si le dossier sélectionné n'existe plus, on revient à « Toutes ».
  const activeFilter = filter === "all" || filter === "none" || folders.some((f) => f.id === filter) ? filter : "all";
  const folderNames = new Map(folders.map((f) => [f.id, f.name]));
  const visibleNotes = optimisticNotes.filter((n) =>
    activeFilter === "all" ? true : activeFilter === "none" ? n.folderId === null : n.folderId === activeFilter,
  );

  function saveNote(id: string | null, input: NoteInput) {
    setNoteTarget(null);
    const note: NoteView = { id: id ?? `temp-${crypto.randomUUID()}`, updatedAt: new Date(), ...input };
    startTransition(async () => {
      apply({ type: "upsert", note });
      await (id ? updateNote(id, input) : createNote(input));
    });
  }

  function removeNote(id: string) {
    setNoteTarget(null);
    startTransition(async () => {
      apply({ type: "delete", id });
      await deleteNote(id);
    });
  }

  function submitFolder(name: string) {
    const target = folderTarget;
    startFolderTransition(async () => {
      if (target === "new") setFilter(await createFolder(name));
      else if (target) await renameFolder(target.id, name);
      setFolderTarget(null);
    });
  }

  function removeFolder(folder: FolderView) {
    startFolderTransition(async () => {
      await deleteFolder(folder.id);
      setFilter("all");
      setFolderTarget(null);
    });
  }

  const defaultFolderId = activeFilter === "all" || activeFilter === "none" ? null : activeFilter;

  return (
    <>
      <PageHeader
        title="Notes"
        action={
          <Button onClick={() => setNoteTarget({ note: null, defaultFolderId })}>
            <PlusIcon className="size-4" />
            Note
          </Button>
        }
      />

      <FolderBar
        folders={folders}
        selected={activeFilter}
        onSelect={setFilter}
        onCreate={() => setFolderTarget("new")}
        onEdit={setFolderTarget}
      />

      {visibleNotes.length === 0 ? (
        <EmptyState icon={<NoteIcon />}>Aucune note ici.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folderName={activeFilter === "all" && note.folderId ? folderNames.get(note.folderId) : undefined}
              onOpen={(n) => !n.id.startsWith("temp-") && setNoteTarget({ note: n, defaultFolderId: n.folderId })}
            />
          ))}
        </div>
      )}

      <NoteSheet
        target={noteTarget}
        folders={folders}
        onClose={() => setNoteTarget(null)}
        onSave={saveNote}
        onDelete={removeNote}
      />
      <FolderSheet
        target={folderTarget}
        pending={folderPending}
        onClose={() => setFolderTarget(null)}
        onSubmit={submitFolder}
        onDelete={removeFolder}
      />
    </>
  );
}
