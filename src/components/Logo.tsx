import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = { size: number; className?: string; priority?: boolean };

/** Logo PurpleLabs : sphère détourée (générée depuis public/icons/labslogo_sansfond.png). */
export function Logo({ size, className, priority }: LogoProps) {
  return (
    <Image
      src="/icons/logo.png"
      alt="PurpleLabs"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0", className)}
    />
  );
}
