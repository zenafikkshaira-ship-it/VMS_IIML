import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AuditViewer } from "./AuditViewer";

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    session.role !== "ADMIN" &&
    session.role !== "IT_ADMIN" &&
    session.role !== "AUDIT"
  ) {
    redirect("/");
  }

  return (
    <AppShell user={session} title="Audit Trail">
      <AuditViewer />
    </AppShell>
  );
}
