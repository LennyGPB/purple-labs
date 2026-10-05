"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { logout } from "@/actions/auth";
import { ChecklistIcon, LogoutIcon, NoteIcon, WalletIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> };

const items: NavItem[] = [
  { href: "/budget", label: "Budget", icon: WalletIcon },
  { href: "/todo", label: "TODO", icon: ChecklistIcon },
  { href: "/notes", label: "Notes", icon: NoteIcon },
];

function LogoutButton({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white",
          className,
        )}
      >
        <LogoutIcon />
        {withLabel && "Se déconnecter"}
      </button>
    </form>
  );
}

/**
 * Barre de navigation : en bas sur mobile, sidebar sur desktop.
 * `prefetch` précharge entièrement chaque section (pages dynamiques) pour une navigation instantanée.
 */
export function AppNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* En-tête mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink/60 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-200">
          <Logo size={26} />
          PurpleLabs
        </div>
        <LogoutButton className="p-2" />
      </header>

      {/* Sidebar desktop */}
      <aside className="glass-strong fixed inset-y-4 left-4 z-30 hidden w-60 flex-col rounded-3xl p-4 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <Logo size={38} priority />
          <span className="text-lg font-semibold tracking-tight">PurpleLabs</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map(({ href, label, icon: ItemIcon }) => (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(href)
                  ? "bg-white/[0.08] text-white [&>svg]:text-violet-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <ItemIcon />
              {label}
            </Link>
          ))}
        </nav>
        <LogoutButton className="w-full px-3 py-2.5" withLabel />
      </aside>

      {/* Barre du bas mobile : sans fond. Un fondu noir masque le contenu qui défile sous les icônes. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[calc(env(safe-area-inset-bottom)+5rem)] bg-gradient-to-t from-black via-black/90 to-transparent md:hidden"
      />
      <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 flex p-1.5 md:hidden">
        {items.map(({ href, label, icon: ItemIcon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-200",
                active ? "text-white [&>svg]:text-violet-400" : "text-zinc-500",
              )}
            >
              <ItemIcon className={cn("transition-transform duration-200", active && "scale-110")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
