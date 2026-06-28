import Link from "next/link";
import { SessionUser } from "@/lib/auth";

interface AppShellProps {
  user: SessionUser;
  title: string;
  children: React.ReactNode;
}

export function AppShell({ user, title, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1e3a5f]/10 bg-[#1e3a5f] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#c9a227]">
              IIM Lucknow
            </p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>
              {user.name}
              <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs">
                {user.role.replace("_", " ")}
              </span>
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded border border-white/30 px-3 py-1 hover:bg-white/10"
                onClick={async (e) => {
                  e.preventDefault();
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-white/10 bg-[#162d4a]">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 py-2 text-sm">
            <NavLink href="/">Home</NavLink>
            {user.role === "HOST" && <NavLink href="/host">My Visitors</NavLink>}
            {(user.role === "SECURITY_GUARD" || user.role === "ADMIN" || user.role === "IT_ADMIN") && (
              <>
                <NavLink href="/guard">Gate Operations</NavLink>
                <NavLink href="/admin">Dashboard</NavLink>
              </>
            )}
            {(user.role === "ADMIN" || user.role === "IT_ADMIN") && (
              <>
                <NavLink href="/admin/blacklist">Blacklist</NavLink>
                <NavLink href="/admin/audit">Audit Log</NavLink>
              </>
            )}
            {user.role === "AUDIT" && <NavLink href="/audit">Audit Reports</NavLink>}
            <NavLink href="/kiosk">Kiosk</NavLink>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
