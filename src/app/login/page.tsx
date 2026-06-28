"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    router.push(data.redirect ?? "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e3a5f] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-[#c9a227]">
            IIM Lucknow
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#1e3a5f]">
            Visitor Management System
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in with your institutional credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              placeholder="prof.sharma@iiml.ac.in"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1e3a5f] py-2.5 font-medium text-white hover:bg-[#162d4a] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-medium">Demo accounts (password: password123)</p>
          <ul className="mt-1 space-y-0.5">
            <li>prof.sharma@iiml.ac.in — Host</li>
            <li>guard@iiml.ac.in — Security Guard</li>
            <li>admin@iiml.ac.in — Admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
