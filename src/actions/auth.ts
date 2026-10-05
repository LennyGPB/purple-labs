"use server";

import { redirect } from "next/navigation";
import { checkPassword } from "@/lib/auth";
import { endSession, startSession } from "@/lib/session";

export type LoginState = { error?: string };

/** N'accepte qu'un chemin interne pour éviter les redirections ouvertes. */
function safeRedirectPath(value: FormDataEntryValue | null): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/budget";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !(await checkPassword(password))) {
    return { error: "Mot de passe incorrect" };
  }
  await startSession();
  redirect(safeRedirectPath(formData.get("from")));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}
