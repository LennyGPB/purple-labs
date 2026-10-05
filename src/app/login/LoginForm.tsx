"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="flex flex-col gap-3">
      {from && <input type="hidden" name="from" value={from} />}
      <Input
        type="password"
        name="password"
        placeholder="Mot de passe"
        autoComplete="current-password"
        autoFocus
        required
        aria-invalid={Boolean(state.error)}
      />
      {state.error && <p className="animate-fade-in text-sm text-rose-300">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Connexion…" : "Entrer"}
      </Button>
    </form>
  );
}
