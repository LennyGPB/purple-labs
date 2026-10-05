"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { createNote, deleteNote, updateNote, type NoteInput } from "@/actions/notes";
import { ChevronIcon, FolderIcon, TrashIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { FolderView, NoteView } from "./types";

const AUTOSAVE_DELAY = 700;
const UNTITLED = "Sans titre";

type NoteEditorProps = {
  /** Note à modifier, ou null pour une nouvelle note */
  note: NoteView | null;
  defaultFolderId: string | null;
  folders: FolderView[];
  onClose: () => void;
};

/**
 * Éditeur plein écran. La première ligne est le titre, Entrée passe au contenu.
 * Enregistrement automatique pendant la saisie et à la fermeture ; une note vidée est supprimée.
 * Le geste « retour » d'Android ferme l'éditeur (entrée d'historique dédiée).
 */
export function NoteEditor({ note, defaultFolderId, folders, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title === UNTITLED ? "" : (note?.title ?? ""));
  const [content, setContent] = useState(note?.content ?? "");
  const [folderId, setFolderId] = useState(note ? note.folderId : defaultFolderId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef<string | null>(note?.id ?? null);
  const valuesRef = useRef<NoteInput>({ title, content, folderId });
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const closingRef = useRef(false);
  const historyPushedRef = useRef(false);

  /** Enchaîne les enregistrements pour ne jamais créer deux fois la même note. */
  function persist() {
    dirtyRef.current = false;
    const { title: t, content: c, folderId: f } = valuesRef.current;
    const input: NoteInput = { title: t.trim() || UNTITLED, content: c, folderId: f };
    const isEmpty = !t.trim() && !c.trim();
    queueRef.current = queueRef.current
      .then(async () => {
        if (idRef.current) await updateNote(idRef.current, input);
        else if (!isEmpty) idRef.current = await createNote(input);
      })
      .catch(() => {
        dirtyRef.current = true; // sera retenté au prochain enregistrement
      });
  }

  function change(next: Partial<NoteInput>) {
    valuesRef.current = { ...valuesRef.current, ...next };
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(persist, AUTOSAVE_DELAY);
  }

  /** Ferme l'éditeur : enregistre ce qui reste, supprime la note si elle a été vidée. */
  function finish() {
    if (closingRef.current) return;
    closingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const { title: t, content: c } = valuesRef.current;
    if (!t.trim() && !c.trim()) {
      queueRef.current = queueRef.current.then(async () => {
        if (idRef.current) await deleteNote(idRef.current);
      });
    } else if (dirtyRef.current) {
      persist();
    }
    onClose();
  }

  // Entrée d'historique : le bouton/geste « retour » ferme l'éditeur au lieu de quitter la page.
  useEffect(() => {
    // Garde : en dev, React (StrictMode) exécute l'effet deux fois.
    if (!historyPushedRef.current) {
      window.history.pushState({ noteEditor: true }, "");
      historyPushedRef.current = true;
    }
    const onPopState = () => finish();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && window.history.back();
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!note) titleRef.current?.focus();
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // Monté une seule fois par ouverture de l'éditeur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    window.history.back(); // déclenche popstate → finish()
  }

  function removeNote() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    valuesRef.current = { ...valuesRef.current, title: "", content: "" };
    close();
  }

  // Titre : Entrée passe au contenu ; un collage multiligne déborde dans le contenu.
  function onTitleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = contentRef.current;
      el?.focus();
      el?.setSelectionRange(0, 0);
    }
  }

  function onTitlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    const lineBreak = text.indexOf("\n");
    if (lineBreak === -1) return;
    e.preventDefault();
    const nextTitle = title + text.slice(0, lineBreak).trim();
    const nextContent = text.slice(lineBreak + 1) + (content ? `\n${content}` : "");
    setTitle(nextTitle);
    setContent(nextContent);
    change({ title: nextTitle, content: nextContent });
    contentRef.current?.focus();
  }

  // Retour arrière au début du contenu vide : remonte au titre.
  function onContentKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "Backspace" && el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault();
      const t = titleRef.current;
      t?.focus();
      t?.setSelectionRange(t.value.length, t.value.length);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={note ? "Modifier la note" : "Nouvelle note"}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-black"
    >
      <header className="flex items-center gap-2 px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 md:px-6 md:pt-6">
        <IconButton label="Fermer la note" onClick={close}>
          <ChevronIcon className="size-5 rotate-180" />
        </IconButton>
        <div className="relative ml-auto">
          <FolderIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <select
            aria-label="Dossier"
            value={folderId ?? ""}
            onChange={(e) => {
              const next = e.target.value || null;
              setFolderId(next);
              change({ folderId: next });
            }}
            className="h-9 max-w-44 appearance-none truncate rounded-full border border-white/10 bg-white/5 pr-3.5 pl-8 text-sm text-zinc-300 outline-none [&>option]:bg-[#121214]"
          >
            <option value="">Sans dossier</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <IconButton
          label={confirmDelete ? "Confirmer la suppression" : "Supprimer la note"}
          onClick={removeNote}
          onBlur={() => setConfirmDelete(false)}
          className={cn(confirmDelete && "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200")}
        >
          <TrashIcon className="size-5" />
        </IconButton>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:px-8">
        <textarea
          ref={titleRef}
          value={title}
          rows={1}
          maxLength={200}
          placeholder="Titre"
          aria-label="Titre"
          onChange={(e) => {
            const next = e.target.value.replace(/\n/g, " ");
            setTitle(next);
            change({ title: next });
          }}
          onKeyDown={onTitleKeyDown}
          onPaste={onTitlePaste}
          className="field-sizing-content w-full resize-none bg-transparent pt-2 text-2xl leading-tight font-semibold text-white outline-none placeholder:text-zinc-600"
        />
        <textarea
          ref={contentRef}
          value={content}
          maxLength={100_000}
          placeholder="Écris ici…"
          aria-label="Contenu"
          onChange={(e) => {
            setContent(e.target.value);
            change({ content: e.target.value });
          }}
          onKeyDown={onContentKeyDown}
          className="mt-3 w-full flex-1 resize-none bg-transparent text-base leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}
