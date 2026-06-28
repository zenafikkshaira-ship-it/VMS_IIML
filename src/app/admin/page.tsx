import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    session.role !== "SECURITY_GUARD" &&
    session.role !== "ADMIN" &&
    session.role !== "IT_ADMIN" &&
    session.role !== "AUDIT"
  ) {
    redirect("/");
  }

  return (
    <AppShell user={session} title="Security Dashboard">
      <AdminDashboard readOnly={session.role === "AUDIT"} />
    </AppShell>
  );
}
