import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
};

/** Case à cocher ronde animée. Le libellé n'est lu que par les lecteurs d'écran. */
export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-90",
        "before:absolute before:-inset-2.5 before:content-['']",
        checked
          ? "border-transparent bg-gradient-to-br from-violet-500 to-violet-600 shadow-md shadow-violet-500/25"
          : "border-zinc-500/60 bg-white/5 hover:border-violet-400/70",
        className,
      )}
    >
      {checked && <CheckIcon className="size-4 animate-pop text-white" strokeWidth={2.6} />}
    </button>
  );
}
