"use client";

import { useCallback, useEffect, useState } from "react";

type Entry = {
  id: string;
  name: string;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  phone: string | null;
  reason: string;
  addedBy: { name: string };
  createdAt: string;
};

export function BlacklistManager() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({
    name: "",
    idDocumentType: "AADHAAR",
    idDocumentNumber: "",
    phone: "",
    reason: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/blacklist");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({
        name: "",
        idDocumentType: "AADHAAR",
        idDocumentNumber: "",
        phone: "",
        reason: "",
      });
      load();
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Add to Blacklist</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <select
            value={form.idDocumentType}
            onChange={(e) => setForm({ ...form, idDocumentType: e.target.value })}
            className="rounded-lg border px-3 py-2"
          >
            <option value="AADHAAR">Aadhaar</option>
            <option value="PAN">PAN</option>
            <option value="PASSPORT">Passport</option>
          </select>
          <input
            placeholder="ID number"
            value={form.idDocumentNumber}
            onChange={(e) => setForm({ ...form, idDocumentNumber: e.target.value })}
            className="rounded-lg border px-3 py-2"
          />
          <input
            required
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="rounded-lg border px-3 py-2 sm:col-span-2"
          />
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white">
          Add to Blacklist
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone / ID</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3">
                  {e.phone ?? e.idDocumentNumber ?? "—"}
                </td>
                <td className="px-4 py-3">{e.reason}</td>
                <td className="px-4 py-3">
                  {new Date(e.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
