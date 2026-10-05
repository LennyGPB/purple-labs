"use client";

import { useState, type FormEvent } from "react";
import type { NoteInput } from "@/actions/notes";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import type { FolderView, NoteView } from "./types";

/** null = fermé ; { note: null } = création ; { note } = édition. */
export type NoteSheetTarget = null | { note: NoteView | null; defaultFolderId: string | null };

type NoteSheetProps = {
  target: NoteSheetTarget;
  folders: FolderView[];
  onClose: () => void;
  onSave: (id: string | null, input: NoteInput) => void;
  onDelete: (id: string) => void;
};

export function NoteSheet({ target, folders, onClose, onSave, onDelete }: NoteSheetProps) {
  return (
    <Sheet open={target !== null} onClose={onClose} title={target?.note ? "Modifier la note" : "Nouvelle note"}>
      {target && (
        <NoteForm
          key={target.note?.id ?? "new"}
          note={target.note}
          defaultFolderId={target.defaultFolderId}
          folders={folders}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

type NoteFormProps = Pick<NoteSheetProps, "folders" | "onSave" | "onDelete"> & {
  note: NoteView | null;
  defaultFolderId: string | null;
};

function NoteForm({ note, defaultFolderId, folders, onSave, onDelete }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [folderId, setFolderId] = useState(note ? note.folderId : defaultFolderId);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(note?.id ?? null, { title: title.trim(), content, folderId });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        aria-label="Titre"
        maxLength={200}
        required
        autoFocus={!note}
        className="text-base font-medium"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu…"
        aria-label="Contenu"
        maxLength={100_000}
        className="min-h-[40dvh]"
      />
      <Label>
        Dossier
        <Select value={folderId ?? ""} onChange={(e) => setFolderId(e.target.value || null)}>
          <option value="">Sans dossier</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
      </Label>
      <div className="flex gap-2">
        {note && <ConfirmDeleteButton onConfirm={() => onDelete(note.id)} />}
        <Button type="submit" className="flex-1" disabled={!title.trim()}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
