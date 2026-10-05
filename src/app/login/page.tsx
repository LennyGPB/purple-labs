import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion · PurpleLabs" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <GlassCard className="w-full max-w-sm animate-slide-up p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo size={80} priority className="drop-shadow-[0_8px_24px_rgb(139_92_246/0.35)]" />
          <h1 className="text-2xl font-semibold tracking-tight">PurpleLabs</h1>
        </div>
        <LoginForm from={typeof from === "string" ? from : undefined} />
      </GlassCard>
    </main>
  );
}
