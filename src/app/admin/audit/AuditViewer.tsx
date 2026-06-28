"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  metadata: Record<string, unknown>;
};

export function AuditViewer() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
            <th className="px-4 py-3">User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString("en-IN")}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
              <td className="px-4 py-3">
                {log.entityType} / {log.entityId.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">{log.user?.name ?? "System"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
