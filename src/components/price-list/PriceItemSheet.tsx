"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Input, Label } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { centsToInput, parseEurosToCents } from "@/lib/money";
import type { PriceItemInput } from "@/lib/price-item";
import type { PriceItem, PriceListLabels } from "./types";

/** null = fermé ; "new" = création ; PriceItem = édition. */
export type PriceItemSheetTarget = null | "new" | PriceItem;

type PriceItemSheetProps = {
  target: PriceItemSheetTarget;
  labels: PriceListLabels;
  onClose: () => void;
  onSave: (id: string | null, input: PriceItemInput) => void;
  onDelete: (id: string) => void;
};

export function PriceItemSheet({ target, labels, onClose, onSave, onDelete }: PriceItemSheetProps) {
  const item = target === "new" ? null : target;

  return (
    <Sheet open={target !== null} onClose={onClose} title={item ? labels.editItem : labels.newItem}>
      {target && (
        <PriceItemForm
          key={item?.id ?? "new"}
          item={item}
          titlePlaceholder={labels.titlePlaceholder}
          amountLabel={labels.amountLabel}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

type PriceItemFormProps = Pick<PriceItemSheetProps, "onSave" | "onDelete"> & {
  item: PriceItem | null;
  titlePlaceholder: string;
  amountLabel: string;
};

function PriceItemForm({ item, titlePlaceholder, amountLabel, onSave, onDelete }: PriceItemFormProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [price, setPrice] = useState(item ? centsToInput(item.priceCents) : "");
  const priceCents = parseEurosToCents(price);
  const priceInvalid = price.trim() !== "" && priceCents === null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || priceCents === null) return;
    onSave(item?.id ?? null, { title: title.trim(), priceCents });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Label>
        Titre
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          maxLength={120}
          required
          autoFocus={!item}
        />
      </Label>
      <Label>
        {amountLabel}
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="9,99"
          required
          aria-invalid={priceInvalid}
          className={priceInvalid ? "border-rose-400/60" : undefined}
        />
        {priceInvalid && <span className="text-xs normal-case text-rose-300">Montant invalide (ex. 9,99)</span>}
      </Label>
      <div className="flex gap-2">
        {item && <ConfirmDeleteButton onConfirm={() => onDelete(item.id)} />}
        <Button type="submit" className="flex-1" disabled={!title.trim() || priceCents === null}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
