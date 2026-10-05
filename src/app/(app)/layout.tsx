import { AppNav } from "@/components/nav/AppNav";
import { requireSession } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireSession();

  return (
    <div className="min-h-dvh md:pl-68">
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:px-8 md:pt-10 md:pb-12">
        {children}
      </main>
    </div>
  );
}
