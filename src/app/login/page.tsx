import type { Metadata } from "next";
import { FlaskIcon } from "@/components/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion · PurpleLabs" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <GlassCard className="w-full max-w-sm animate-slide-up p-7">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 shadow-lg shadow-black/50">
            <FlaskIcon className="size-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">PurpleLabs</h1>
        </div>
        <LoginForm from={typeof from === "string" ? from : undefined} />
      </GlassCard>
    </main>
  );
}
