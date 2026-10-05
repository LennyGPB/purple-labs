import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-black/40 hover:from-violet-400 hover:to-violet-600",
  ghost: "bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10",
  danger: "bg-rose-500/15 text-rose-200 border border-rose-400/20 hover:bg-rose-500/25",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

export function IconButton({ label, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
