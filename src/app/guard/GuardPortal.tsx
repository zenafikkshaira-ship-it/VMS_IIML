"use client";

import { useState } from "react";
import { GatePassCard } from "@/components/GatePassCard";

type CheckedInVisit = {
  id: string;
  visitCode: string;
  visitorName: string;
  purpose: string;
  validUntil: string | null;
  host: { name: string; department: string | null };
};

export function GuardPortal() {
  const [visitCode, setVisitCode] = useState("");
  const [message, setMessage] = useState("");
  const [passVisit, setPassVisit] = useState<CheckedInVisit | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    setLoading(true);
    setMessage("");
    setPassVisit(null);

    const res = await fetch("/api/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitCode: visitCode.trim().toUpperCase() }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage("Check-in successful. Print gate pass below.");
      setPassVisit(data.visit);
    } else {
      setMessage(data.error ?? "Check-in failed");
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/check-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitCode: visitCode.trim().toUpperCase() }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage(`Checked out: ${data.visit.visitorName}`);
      setPassVisit(null);
      setVisitCode("");
    } else {
      setMessage(data.error ?? "Check-out failed");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#1e3a5f]">Scan / Enter Visit Code</h2>
        <p className="mt-1 text-sm text-gray-600">
          Scan visitor QR or enter visit code manually
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="VMS-XXXXXX"
            value={visitCode}
            onChange={(e) => setVisitCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border-2 border-[#1e3a5f]/20 px-4 py-3 font-mono text-lg uppercase focus:border-[#1e3a5f] focus:outline-none"
          />

          <div className="flex gap-3">
            <button
              type="button"
              disabled={!visitCode || loading}
              onClick={handleCheckIn}
              className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Check In
            </button>
            <button
              type="button"
              disabled={!visitCode || loading}
              onClick={handleCheckOut}
              className="flex-1 rounded-lg bg-[#1e3a5f] py-3 font-medium text-white hover:bg-[#162d4a] disabled:opacity-50"
            >
              Check Out
            </button>
          </div>

          {message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                message.includes("successful") || message.includes("Checked out")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </section>

      <section>
        {passVisit ? (
          <GatePassCard
            visitCode={passVisit.visitCode}
            visitorName={passVisit.visitorName}
            hostName={passVisit.host.name}
            purpose={passVisit.purpose}
            validUntil={passVisit.validUntil}
          />
        ) : (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-8 text-center text-gray-500">
            Gate pass will appear here after successful check-in
          </div>
        )}
      </section>
    </div>
  );
}
