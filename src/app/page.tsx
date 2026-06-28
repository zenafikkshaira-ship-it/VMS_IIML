import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <header className="bg-[#1e3a5f] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-widest text-[#c9a227]">
            Indian Institute of Management Lucknow
          </p>
          <h1 className="mt-2 text-3xl font-bold">Visitor Management System</h1>
          <p className="mt-2 text-white/80">
            Welcome, {session.name}. Select your workspace below.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-4 px-6 py-8 sm:grid-cols-2">
        {session.role === "HOST" && (
          <PortalCard
            href="/host"
            title="Host Portal"
            description="Pre-invite visitors, approve arrivals, view history"
          />
        )}
        {(session.role === "SECURITY_GUARD" ||
          session.role === "ADMIN" ||
          session.role === "IT_ADMIN") && (
          <>
            <PortalCard
              href="/guard"
              title="Gate Operations"
              description="Scan QR, check-in/out, register walk-ins"
            />
            <PortalCard
              href="/admin"
              title="Security Dashboard"
              description="Live campus occupancy, overstays, today's summary"
            />
          </>
        )}
        {(session.role === "ADMIN" || session.role === "IT_ADMIN") && (
          <>
            <PortalCard
              href="/admin/blacklist"
              title="Blacklist Management"
              description="Manage blocked individuals"
            />
            <PortalCard
              href="/admin/audit"
              title="Audit Trail"
              description="Immutable action logs for compliance"
            />
          </>
        )}
        {session.role === "AUDIT" && (
          <PortalCard
            href="/audit"
            title="Audit Reports"
            description="Read-only access to all logs and reports"
          />
        )}
        <PortalCard
          href="/kiosk"
          title="Walk-in Kiosk"
          description="Self-service registration for gate visitors"
        />
      </main>
    </div>
  );
}

function PortalCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-[#1e3a5f]/10 bg-white p-6 shadow-sm transition hover:border-[#c9a227] hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </Link>
  );
}
