"use client";

import { useState, useTransition } from "react";
import { createFolder, deleteFolder, renameFolder } from "@/actions/notes";
import { FolderIcon, NoteIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar, groupFromFilter, matchesFilter, resolveFilter, type Filter } from "@/components/ui/FilterBar";
import { NamedItemSheet, type NamedItemSheetTarget } from "@/components/ui/NamedItemSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";
import type { FolderView, NoteView } from "./types";

/** null = éditeur fermé ; { note: null } = nouvelle note ; { note } = édition. */
type EditorTarget = null | { note: NoteView | null; key: string };

export function NotesBoard({ notes, folders }: { notes: NoteView[]; folders: FolderView[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [editor, setEditor] = useState<EditorTarget>(null);
  const [folderTarget, setFolderTarget] = useState<NamedItemSheetTarget>(null);
  const [folderPending, startFolderTransition] = useTransition();

  const activeFilter = resolveFilter(filter, folders);
  const folderNames = new Map(folders.map((f) => [f.id, f.name]));
  const visibleNotes = notes.filter((n) => matchesFilter(n.folderId, activeFilter));

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

  return (
    <>
      <PageHeader
        title="Notes"
        action={
          <Button onClick={() => setEditor({ note: null, key: crypto.randomUUID() })}>
            <PlusIcon className="size-4" />
            Note
          </Button>
        }
      />

      <FilterBar
        items={folders}
        selected={activeFilter}
        labels={{ all: "Toutes", none: "Sans dossier", create: "Dossier", edit: "Modifier le dossier" }}
        icon={<FolderIcon className="size-4" />}
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
              onOpen={(n) => setEditor({ note: n, key: n.id })}
            />
          ))}
        </div>
      )}

      {editor && (
        <NoteEditor
          key={editor.key}
          note={editor.note}
          defaultFolderId={groupFromFilter(activeFilter)}
          folders={folders}
          onClose={() => setEditor(null)}
        />
      )}
      <NamedItemSheet
        target={folderTarget}
        labels={{
          newTitle: "Nouveau dossier",
          editTitle: "Modifier le dossier",
          deleteHint: "Supprimer le dossier conserve ses notes (sans dossier).",
        }}
        pending={folderPending}
        onClose={() => setFolderTarget(null)}
        onSubmit={submitFolder}
        onDelete={removeFolder}
      />
    </>
  );
}
