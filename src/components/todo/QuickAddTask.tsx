"use client";

import { useState, type FormEvent } from "react";
import type { TaskInput } from "@/actions/tasks";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";
import { DateTimeFields } from "./DateTimeFields";

/** Barre d'ajout rapide : titre + Entrée, date/heure en option. La catégorie est fixée par le parent. */
export function QuickAddTask({ onAdd }: { onAdd: (input: Omit<TaskInput, "categoryId">) => void }) {
  const [title, setTitle] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [due, setDue] = useState({ date: "", time: "" });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), date: due.date || null, time: due.time || null });
    setTitle("");
    setDue({ date: "", time: "" });
    setShowDate(false);
  }

  return (
    <GlassCard className="mb-6 p-2">
      <form onSubmit={submit}>
        <div className="flex items-center gap-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nouvelle tâche…"
            aria-label="Nouvelle tâche"
            maxLength={300}
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-zinc-500"
          />
          <IconButton
            label="Ajouter une date"
            onClick={() => setShowDate((v) => !v)}
            className={cn((showDate || due.date) && "bg-white/10 text-violet-300")}
          >
            <CalendarIcon />
          </IconButton>
          <IconButton
            type="submit"
            label="Ajouter la tâche"
            disabled={!title.trim()}
            className="bg-gradient-to-br from-violet-500 to-violet-700 text-white hover:from-violet-400 hover:text-white"
          >
            <PlusIcon />
          </IconButton>
        </div>
        {showDate && (
          <div className="animate-fade-in px-1 pt-2 pb-1">
            <DateTimeFields date={due.date} time={due.time} onChange={setDue} />
          </div>
        )}
      </form>
    </GlassCard>
  );
}
