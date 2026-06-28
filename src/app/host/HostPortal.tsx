"use client";

import { useCallback, useEffect, useState } from "react";
import { Visit, VisitStatus } from "@prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { GatePassCard } from "@/components/GatePassCard";

type VisitWithHost = Visit & {
  host: { id: string; name: string; department: string | null; email: string };
};

export function HostPortal() {
  const [visits, setVisits] = useState<VisitWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VisitWithHost | null>(null);
  const [form, setForm] = useState({
    visitorName: "",
    visitorPhone: "",
    visitorEmail: "",
    organization: "",
    purpose: "",
    expectedAt: "",
    durationMinutes: 120,
    escortRequired: false,
  });

  const loadVisits = useCallback(async () => {
    const res = await fetch("/api/visits?scope=mine");
    const data = await res.json();
    setVisits(data.visits ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVisits();
    const interval = setInterval(loadVisits, 15000);
    return () => clearInterval(interval);
  }, [loadVisits]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({
        visitorName: "",
        visitorPhone: "",
        visitorEmail: "",
        organization: "",
        purpose: "",
        expectedAt: "",
        durationMinutes: 120,
        escortRequired: false,
      });
      loadVisits();
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to create invitation");
    }
  }

  async function handleAction(id: string, action: "approve" | "reject" | "cancel") {
    const res = await fetch(`/api/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) loadVisits();
  }

  const pending = visits.filter((v) => v.status === VisitStatus.PENDING_APPROVAL);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">My Visitors</h2>
          <p className="text-gray-600">Pre-register guests and approve walk-in arrivals</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-white hover:bg-[#162d4a]"
        >
          {showForm ? "Cancel" : "+ Pre-invite Visitor"}
        </button>
      </div>

      {pending.length > 0 && (
        <section className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">
            Pending Approvals ({pending.length})
          </h3>
          <div className="mt-3 space-y-2">
            {pending.map((v) => (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3"
              >
                <div>
                  <p className="font-medium">{v.visitorName}</p>
                  <p className="text-sm text-gray-600">{v.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(v.id, "approve")}
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(v.id, "reject")}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showForm && (
        <form
          onSubmit={handleInvite}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold">Pre-invite Visitor</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Visitor Name *" value={form.visitorName} onChange={(v) => setForm({ ...form, visitorName: v })} required />
            <Input label="Phone *" value={form.visitorPhone} onChange={(v) => setForm({ ...form, visitorPhone: v })} required />
            <Input label="Email" value={form.visitorEmail} onChange={(v) => setForm({ ...form, visitorEmail: v })} />
            <Input label="Organization" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
            <Input label="Purpose *" value={form.purpose} onChange={(v) => setForm({ ...form, purpose: v })} required className="sm:col-span-2" />
            <div>
              <label className="block text-sm font-medium">Expected Date/Time *</label>
              <input
                type="datetime-local"
                required
                value={form.expectedAt}
                onChange={(e) => setForm({ ...form, expectedAt: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration (minutes)</label>
              <input
                type="number"
                min={30}
                max={480}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.escortRequired}
                onChange={(e) => setForm({ ...form, escortRequired: e.target.checked })}
              />
              Escort required (sensitive visit)
            </label>
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-[#c9a227] px-6 py-2 font-medium text-white">
            Send Invitation
          </button>
        </form>
      )}

      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] overflow-auto rounded-xl bg-[#f8f6f1] p-4">
            <button
              type="button"
              onClick={() => setSelectedPass(null)}
              className="absolute right-4 top-4 text-gray-500"
            >
              ✕
            </button>
            <GatePassCard
              visitCode={selectedPass.visitCode}
              visitorName={selectedPass.visitorName}
              hostName={selectedPass.host.name}
              purpose={selectedPass.purpose}
              validUntil={selectedPass.validUntil?.toString()}
            />
          </div>
        </div>
      )}

      <section>
        <h3 className="mb-3 font-semibold">Visitor History</h3>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : visits.length === 0 ? (
          <p className="text-gray-500">No visitors yet. Pre-invite your first guest.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.visitorName}</p>
                      <p className="text-xs text-gray-500">{v.visitCode}</p>
                    </td>
                    <td className="px-4 py-3">{v.purpose}</td>
                    <td className="px-4 py-3">
                      {new Date(v.expectedAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPass(v)}
                          className="text-[#1e3a5f] underline"
                        >
                          Gate Pass
                        </button>
                        {v.status === VisitStatus.INVITED && (
                          <button
                            type="button"
                            onClick={() => handleAction(v.id, "cancel")}
                            className="text-red-600 underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2"
      />
    </div>
  );
}
