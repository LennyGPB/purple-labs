"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SwipeAction = {
  label: string;
  icon: ReactNode;
  /** Classes de fond de la zone révélée, ex. "bg-violet-600" */
  className: string;
  onTrigger: () => void;
  /** "collapse" fait sortir la ligne de l'écran avant d'agir (suppression) ; sinon elle revient en place. */
  exit?: "collapse";
};

type SwipeRowProps = {
  children: ReactNode;
  /** Action déclenchée en glissant vers la droite */
  right?: SwipeAction;
  /** Action déclenchée en glissant vers la gauche */
  left?: SwipeAction;
  className?: string;
};

const DIRECTION_LOCK = 10; // px avant de décider si le geste est horizontal ou vertical
const MAX_THRESHOLD = 110; // px à dépasser pour déclencher l'action

/**
 * Ligne glissable au doigt (ou à la souris). Le défilement vertical reste natif (touch-action: pan-y).
 * Un glissement horizontal annule le clic sur le contenu.
 */
export function SwipeRow({ children, right, left, className }: SwipeRowProps) {
  const [offset, setOffsetState] = useState(0);
  const offsetRef = useRef(0); // valeur à jour pour pointerup, sans attendre le rendu
  const [dragging, setDragging] = useState(false);
  const [rowWidth, setRowWidth] = useState(300); // mesurée au début de chaque geste
  const [leaving, setLeaving] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null; armed: boolean } | null>(null);
  const suppressClick = useRef(false);

  function setOffset(value: number) {
    offsetRef.current = value;
    setOffsetState(value);
  }

  const threshold = Math.min(MAX_THRESHOLD, rowWidth * 0.35);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (leaving || (e.pointerType === "mouse" && e.button !== 0)) return;
    gesture.current = { x: e.clientX, y: e.clientY, axis: null, armed: false };
    setRowWidth(rowRef.current?.offsetWidth ?? 300);
    suppressClick.current = false;
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    if (g.axis === null) {
      if (Math.abs(dx) < DIRECTION_LOCK && Math.abs(dy) < DIRECTION_LOCK) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (g.axis === "y") {
        gesture.current = null; // défilement vertical : on laisse faire
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      suppressClick.current = true;
    }

    // Pas d'action dans ce sens : forte résistance.
    const action = dx > 0 ? right : left;
    const next = action ? dx : dx * 0.15;
    setOffset(next);

    const armed = action !== undefined && Math.abs(next) >= threshold;
    if (armed !== g.armed) {
      g.armed = armed;
      if (armed) navigator.vibrate?.(8);
    }
  }

  function onPointerEnd() {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.axis !== "x") return;
    setDragging(false);

    const current = offsetRef.current;
    const action = current > 0 ? right : left;
    if (!action || !g.armed) {
      setOffset(0);
      return;
    }
    if (action.exit === "collapse") {
      setLeaving(true);
      setOffset(Math.sign(current) * rowWidth);
      setTimeout(action.onTrigger, 200);
    } else {
      setOffset(0);
      action.onTrigger();
    }
  }

  const progress = Math.min(1, Math.abs(offset) / threshold);
  const revealed = offset > 0 ? right : offset < 0 ? left : undefined;

  return (
    <div ref={rowRef} className={cn("relative overflow-hidden", className)}>
      {revealed && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center px-6 text-white",
            offset > 0 ? "justify-start" : "justify-end",
            revealed.className,
          )}
          style={{ opacity: 0.35 + progress * 0.65 }}
        >
          <span
            className="flex items-center gap-2 text-sm font-medium transition-transform duration-150"
            style={{ transform: `scale(${progress >= 1 ? 1.1 : 0.85 + progress * 0.15})` }}
          >
            {revealed.icon}
            {revealed.label}
          </span>
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
        className={cn(
          "relative touch-pan-y bg-[#0f0f10] select-none",
          !dragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
