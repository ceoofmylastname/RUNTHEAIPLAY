"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Invalid password.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[440px]">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[36px] bg-cyan-brand/15 blur-3xl animate-pulse-glow"
      />
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-md sm:p-10">
        <div className="brand-border-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
          <Lock size={22} className="text-white" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
          Admin Access
        </h1>
        <p className="mt-2 text-center text-sm text-white/55">
          Enter the operator passphrase to view leads.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            className="input-base"
            type="password"
            placeholder="Passphrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <div className="pt-2">
            <PrimaryButton type="submit" disabled={submitting || !password}>
              {submitting ? "Verifying…" : "Enter Dashboard"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginForm;
