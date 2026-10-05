"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "@/components/icons";
import { IconButton } from "./Button";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Feuille modale : glisse depuis le bas sur mobile, centrée sur desktop. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass-strong relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:max-w-lg md:rounded-3xl md:pb-0"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20 md:hidden" />
        <div className="flex items-center justify-between px-5 pt-3 pb-1 md:pt-5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <IconButton label="Fermer" onClick={onClose}>
            <XIcon />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 pt-2 pb-5">{children}</div>
      </div>
    </div>
  );
}
