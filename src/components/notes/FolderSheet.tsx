"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Input, Label } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import type { FolderView } from "./types";

/** null = fermé, "new" = création, FolderView = édition. */
export type FolderSheetTarget = null | "new" | FolderView;

type FolderSheetProps = {
  target: FolderSheetTarget;
  pending: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  onDelete: (folder: FolderView) => void;
};

export function FolderSheet({ target, pending, onClose, onSubmit, onDelete }: FolderSheetProps) {
  const isNew = target === "new";

  return (
    <Sheet open={target !== null} onClose={onClose} title={isNew ? "Nouveau dossier" : "Modifier le dossier"}>
      {target && (
        <FolderForm
          key={isNew ? "new" : target.id}
          folder={isNew ? null : target}
          pending={pending}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

type FolderFormProps = Pick<FolderSheetProps, "pending" | "onSubmit" | "onDelete"> & { folder: FolderView | null };

function FolderForm({ folder, pending, onSubmit, onDelete }: FolderFormProps) {
  const [name, setName] = useState(folder?.name ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Label>
        Nom
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required autoFocus />
      </Label>
      {folder && <p className="text-xs text-zinc-500">Supprimer le dossier conserve ses notes (sans dossier).</p>}
      <div className="flex gap-2">
        {folder && <ConfirmDeleteButton onConfirm={() => onDelete(folder)} disabled={pending} />}
        <Button type="submit" className="flex-1" disabled={pending || !name.trim()}>
          {folder ? "Renommer" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
