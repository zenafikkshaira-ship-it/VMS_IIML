import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { HostPortal } from "./HostPortal";

export default async function HostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "HOST" && session.role !== "ADMIN" && session.role !== "IT_ADMIN") {
    redirect("/");
  }

  return (
    <AppShell user={session} title="Host Portal">
      <HostPortal />
    </AppShell>
  );
}
