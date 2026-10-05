"use client";

type UndoToastProps = {
  message: string | null;
  onUndo: () => void;
};

/** Bandeau « Annuler » affiché au-dessus de la barre de navigation. */
export function UndoToast({ message, onUndo }: UndoToastProps) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-40 flex justify-center px-4 md:bottom-8 md:left-68">
      <div
        role="status"
        className="glass-strong pointer-events-auto flex max-w-full animate-slide-up items-center gap-4 rounded-2xl py-2 pr-2 pl-4"
      >
        <span className="truncate text-sm text-zinc-200">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-violet-300 transition-colors hover:bg-white/10"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
