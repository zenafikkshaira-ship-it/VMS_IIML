import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { GuardPortal } from "./GuardPortal";

export default async function GuardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (
    session.role !== "SECURITY_GUARD" &&
    session.role !== "ADMIN" &&
    session.role !== "IT_ADMIN"
  ) {
    redirect("/");
  }

  return (
    <AppShell user={session} title="Gate Operations — Main Gate">
      <GuardPortal />
    </AppShell>
  );
}
