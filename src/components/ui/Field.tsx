import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-[15px] text-white placeholder:text-zinc-500 outline-none transition-colors duration-200 focus:border-violet-400/60 focus:bg-white/[0.08] disabled:opacity-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-40 resize-none py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "h-11 appearance-none [&>option]:bg-[#121214]", className)} {...props} />;
}

type LabelProps = { children: ReactNode; className?: string; as?: "label" | "div" };

/** Libellé de champ. `as="div"` pour un groupe de plusieurs champs. */
export function Label({ children, className, as: Tag = "label" }: LabelProps) {
  return (
    <Tag className={cn("flex flex-col gap-1.5 text-xs font-medium tracking-wide text-zinc-400 uppercase", className)}>
      {children}
    </Tag>
  );
}
