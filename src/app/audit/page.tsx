import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AuditViewer } from "@/app/admin/audit/AuditViewer";

export default async function AuditReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "AUDIT") redirect("/");

  return (
    <AppShell user={session} title="Audit Reports">
      <AuditViewer />
    </AppShell>
  );
}
