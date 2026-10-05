"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { Input, Label } from "./Field";
import type { NamedItem } from "./FilterBar";
import { Sheet } from "./Sheet";

/** null = fermé, "new" = création, NamedItem = édition. */
export type NamedItemSheetTarget = null | "new" | NamedItem;

type NamedItemSheetProps = {
  target: NamedItemSheetTarget;
  labels: { newTitle: string; editTitle: string; deleteHint: string };
  pending: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  onDelete: (item: NamedItem) => void;
};

/** Création, renommage et suppression d'un groupe nommé (dossier, catégorie…). */
export function NamedItemSheet({ target, labels, pending, onClose, onSubmit, onDelete }: NamedItemSheetProps) {
  const isNew = target === "new";

  return (
    <Sheet open={target !== null} onClose={onClose} title={isNew ? labels.newTitle : labels.editTitle}>
      {target && (
        <NamedItemForm
          key={isNew ? "new" : target.id}
          item={isNew ? null : target}
          deleteHint={labels.deleteHint}
          pending={pending}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

type NamedItemFormProps = Pick<NamedItemSheetProps, "pending" | "onSubmit" | "onDelete"> & {
  item: NamedItem | null;
  deleteHint: string;
};

function NamedItemForm({ item, deleteHint, pending, onSubmit, onDelete }: NamedItemFormProps) {
  const [name, setName] = useState(item?.name ?? "");

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
      {item && <p className="text-xs text-zinc-500">{deleteHint}</p>}
      <div className="flex gap-2">
        {item && <ConfirmDeleteButton onConfirm={() => onDelete(item)} disabled={pending} />}
        <Button type="submit" className="flex-1" disabled={pending || !name.trim()}>
          {item ? "Renommer" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
