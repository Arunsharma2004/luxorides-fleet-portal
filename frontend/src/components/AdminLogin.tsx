"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage, login } from "@/lib/api";
import { saveSession } from "@/lib/auth";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none";

export default function AdminLogin({ notice }: { notice: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (result.role !== "ADMIN") {
        setError("This account is not an admin account.");
        return;
      }
      saveSession({ token: result.token, role: result.role, name: result.name });
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const message = error ?? notice;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
    >
      <h2 className="text-lg font-semibold">Admin login</h2>
      <p className="text-xs text-neutral-500">Demo admin: admin@luxorides.com / admin123</p>
      <input
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        className={inputClass}
      />
      <input
        required
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className={inputClass}
      />
      {message && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {message}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}