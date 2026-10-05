"use client";

import { useState, type FormEvent } from "react";
import type { SubscriptionInput } from "@/actions/subscriptions";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { Input, Label } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { centsToInput, parseEurosToCents } from "@/lib/money";
import type { SubscriptionView } from "./types";

/** null = fermé ; "new" = création ; SubscriptionView = édition. */
export type SubscriptionSheetTarget = null | "new" | SubscriptionView;

type SubscriptionSheetProps = {
  target: SubscriptionSheetTarget;
  onClose: () => void;
  onSave: (id: string | null, input: SubscriptionInput) => void;
  onDelete: (id: string) => void;
};

export function SubscriptionSheet({ target, onClose, onSave, onDelete }: SubscriptionSheetProps) {
  const subscription = target === "new" ? null : target;

  return (
    <Sheet open={target !== null} onClose={onClose} title={subscription ? "Modifier l'abonnement" : "Nouvel abonnement"}>
      {target && (
        <SubscriptionForm
          key={subscription?.id ?? "new"}
          subscription={subscription}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

type SubscriptionFormProps = Pick<SubscriptionSheetProps, "onSave" | "onDelete"> & {
  subscription: SubscriptionView | null;
};

function SubscriptionForm({ subscription, onSave, onDelete }: SubscriptionFormProps) {
  const [title, setTitle] = useState(subscription?.title ?? "");
  const [price, setPrice] = useState(subscription ? centsToInput(subscription.priceCents) : "");
  const priceCents = parseEurosToCents(price);
  const priceInvalid = price.trim() !== "" && priceCents === null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || priceCents === null) return;
    onSave(subscription?.id ?? null, { title: title.trim(), priceCents });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Label>
        Titre
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Netflix, Spotify…"
          maxLength={120}
          required
          autoFocus={!subscription}
        />
      </Label>
      <Label>
        Prix (€)
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="9,99"
          required
          aria-invalid={priceInvalid}
          className={priceInvalid ? "border-rose-400/60" : undefined}
        />
        {priceInvalid && <span className="text-xs normal-case text-rose-300">Prix invalide (ex. 9,99)</span>}
      </Label>
      <div className="flex gap-2">
        {subscription && <ConfirmDeleteButton onConfirm={() => onDelete(subscription.id)} />}
        <Button type="submit" className="flex-1" disabled={!title.trim() || priceCents === null}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
