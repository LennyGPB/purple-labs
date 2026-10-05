"use client";

import { useState } from "react";
import { TrashIcon } from "@/components/icons";
import { Button } from "./Button";

/** Bouton de suppression en deux temps, pour éviter les suppressions accidentelles. */
export function ConfirmDeleteButton({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);

  return (
    <Button
      variant="danger"
      disabled={disabled}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      onBlur={() => setArmed(false)}
    >
      <TrashIcon className="size-4" />
      {armed ? "Confirmer" : "Supprimer"}
    </Button>
  );
}
