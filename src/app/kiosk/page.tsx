"use client";

import { useEffect, useState } from "react";

type Host = { id: string; name: string; department: string | null };

type Step = "phone" | "otp" | "details" | "waiting" | "done" | "blocked";

export default function KioskPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [hosts, setHosts] = useState<Host[]>([]);
  const [form, setForm] = useState({
    visitorName: "",
    organization: "",
    purpose: "",
    hostId: "",
    idDocumentType: "AADHAAR",
    idDocumentNumber: "",
  });
  const [visitCode, setVisitCode] = useState("");
  const [error, setError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    fetch("/api/public/hosts")
      .then((r) => r.json())
      .then((d) => setHosts(d.hosts ?? []))
      .catch(() => {});
  }, []);

  async function sendOtp() {
    setError("");
    const res = await fetch("/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, action: "send" }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      setStep("otp");
    } else {
      setError(data.error);
    }
  }

  async function verifyOtp() {
    setError("");
    const res = await fetch("/api/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp, action: "verify" }),
    });
    if (res.ok) setStep("details");
    else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function submitWalkIn() {
    setError("");
    const res = await fetch("/api/walk-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        visitorPhone: phone,
        durationMinutes: 120,
      }),
    });
    const data = await res.json();

    if (res.status === 403 && data.error === "BLACKLIST_MATCH") {
      setStep("blocked");
      setError(data.reason);
      return;
    }

    if (res.ok) {
      setVisitCode(data.visit.visitCode);
      setStep("waiting");
      setPollCount(0);
    } else {
      setError(data.error);
    }
  }

  useEffect(() => {
    if (step !== "waiting" || !visitCode) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/pass/${visitCode}`);
      if (!res.ok) return;
      const { visit } = await res.json();

      if (visit.status === "APPROVED" || visit.status === "CHECKED_IN") {
        setStep("done");
        clearInterval(interval);
      } else if (visit.status === "REJECTED" || visit.status === "DENIED") {
        setError("Host rejected your visit. Please contact security.");
        setStep("blocked");
        clearInterval(interval);
      }

      setPollCount((c) => c + 1);
      if (pollCount > 60) {
        setError("Approval timeout. Please see the security guard.");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, visitCode, pollCount]);

  return (
    <div className="min-h-screen bg-[#1e3a5f]">
      <header className="px-6 py-8 text-center text-white">
        <p className="text-sm uppercase tracking-widest text-[#c9a227]">
          IIM Lucknow · Main Gate
        </p>
        <h1 className="mt-2 text-3xl font-bold">Visitor Check-in</h1>
        <p className="mt-2 text-white/70">हिंदी · English</p>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-12">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {step === "phone" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Enter your mobile number</h2>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border-2 px-4 py-4 text-xl"
              />
              <KioskButton onClick={sendOtp} disabled={phone.length < 10}>
                Send OTP
              </KioskButton>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Enter OTP sent to {phone}</h2>
              {debugOtp && (
                <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">
                  Dev OTP: {debugOtp}
                </p>
              )}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border-2 px-4 py-4 text-center text-2xl tracking-widest"
              />
              <KioskButton onClick={verifyOtp} disabled={otp.length !== 6}>
                Verify
              </KioskButton>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Visitor Details</h2>
              <KioskInput label="Full Name" value={form.visitorName} onChange={(v) => setForm({ ...form, visitorName: v })} />
              <KioskInput label="Organization" value={form.organization} onChange={(v) => setForm({ ...form, organization: v })} />
              <KioskInput label="Purpose of Visit" value={form.purpose} onChange={(v) => setForm({ ...form, purpose: v })} />
              <div>
                <label className="block text-sm font-medium">ID Type</label>
                <select
                  value={form.idDocumentType}
                  onChange={(e) => setForm({ ...form, idDocumentType: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-3"
                >
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>
              <KioskInput label="ID Number" value={form.idDocumentNumber} onChange={(v) => setForm({ ...form, idDocumentNumber: v })} />
              <div>
                <label className="block text-sm font-medium">Select Host</label>
                <select
                  required
                  value={form.hostId}
                  onChange={(e) => setForm({ ...form, hostId: e.target.value })}
                  className="mt-1 w-full rounded-lg border px-3 py-3"
                >
                  <option value="">Choose host…</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.department}
                    </option>
                  ))}
                </select>
              </div>
              <KioskButton
                onClick={submitWalkIn}
                disabled={!form.visitorName || !form.purpose || !form.hostId}
              >
                Request Entry
              </KioskButton>
            </div>
          )}

          {step === "waiting" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
              <h2 className="text-xl font-semibold">Waiting for host approval</h2>
              <p className="mt-2 text-gray-600">
                Your host has been notified. Please wait at the gate.
              </p>
              <p className="mt-4 font-mono text-sm text-gray-500">{visitCode}</p>
            </div>
          )}

          {step === "done" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
              <h2 className="text-xl font-semibold text-green-800">Approved!</h2>
              <p className="mt-2 text-gray-600">
                Please proceed to the security desk for your gate pass.
              </p>
              <p className="mt-4 font-mono">{visitCode}</p>
            </div>
          )}

          {step === "blocked" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
                ✕
              </div>
              <h2 className="text-xl font-semibold text-red-800">Entry Not Permitted</h2>
              <p className="mt-2 text-gray-600">{error || "Please contact security."}</p>
            </div>
          )}

          {error && step !== "blocked" && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function KioskButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-[#1e3a5f] py-4 text-lg font-medium text-white hover:bg-[#162d4a] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function KioskInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-3 text-lg"
      />
    </div>
  );
}
