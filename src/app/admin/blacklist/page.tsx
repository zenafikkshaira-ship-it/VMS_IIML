import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BlacklistManager } from "./BlacklistManager";

export default async function BlacklistPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "IT_ADMIN") redirect("/");

  return (
    <AppShell user={session} title="Blacklist Management">
      <BlacklistManager />
    </AppShell>
  );
}
