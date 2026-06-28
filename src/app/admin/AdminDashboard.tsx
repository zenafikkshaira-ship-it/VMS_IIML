"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Visit, VisitStatus } from "@prisma/client";

type DashboardData = {
  onCampus: (Visit & { host: { name: string; department: string | null } })[];
  summary: {
    onCampusCount: number;
    todayEntries: number;
    pendingApprovals: number;
    deniedToday: number;
    overstayCount: number;
  };
  overstays: Visit[];
};

export function AdminDashboard({ readOnly = false }: { readOnly?: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!data) {
    return <p className="text-gray-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="On Campus Now" value={data.summary.onCampusCount} highlight />
        <StatCard label="Today's Entries" value={data.summary.todayEntries} />
        <StatCard label="Pending Approvals" value={data.summary.pendingApprovals} warn />
        <StatCard label="Overstays" value={data.summary.overstayCount} alert />
        <StatCard label="Denied Today" value={data.summary.deniedToday} />
      </div>

      {data.overstays.length > 0 && (
        <section className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <h3 className="font-semibold text-red-900">
            Overstay Alerts ({data.overstays.length})
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {data.overstays.map((v) => (
              <li key={v.id}>
                {v.visitorName} — checked in{" "}
                {v.checkedInAt
                  ? new Date(v.checkedInAt).toLocaleTimeString("en-IN")
                  : "—"}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-lg font-semibold text-[#1e3a5f]">
          Visitors Currently On Campus
        </h3>
        {readOnly && (
          <p className="mb-3 text-sm text-gray-500">Read-only audit view</p>
        )}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Host</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Checked In</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.onCampus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No visitors currently on campus
                  </td>
                </tr>
              ) : (
                data.onCampus.map((v) => (
                  <tr key={v.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{v.visitorName}</td>
                    <td className="px-4 py-3">
                      {v.host.name}
                      <span className="block text-xs text-gray-500">
                        {v.host.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">{v.purpose}</td>
                    <td className="px-4 py-3">
                      {v.checkedInAt
                        ? new Date(v.checkedInAt).toLocaleString("en-IN")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status as VisitStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  warn,
  alert,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  warn?: boolean;
  alert?: boolean;
}) {
  const bg = alert
    ? "border-red-300 bg-red-50"
    : warn
      ? "border-amber-300 bg-amber-50"
      : highlight
        ? "border-[#1e3a5f]/30 bg-[#1e3a5f]/5"
        : "border-gray-200 bg-white";

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#1e3a5f]">{value}</p>
    </div>
  );
}
