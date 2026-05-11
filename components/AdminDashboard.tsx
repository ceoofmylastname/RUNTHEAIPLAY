"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  LogOut,
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";

type Application = {
  role: string;
  aiUse: string;
  primaryPlatform: string;
  monthlyRevenue: string;
  aiExperience: string;
  biggestBlocker: string;
  whyIn: string;
  referralSource: string;
  referralName: string | null;
};

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  application: Application | null;
};

const FIELD_LABELS: Record<keyof Application, string> = {
  role: "Role / Title",
  aiUse: "Primary AI Use",
  primaryPlatform: "Primary Platform",
  monthlyRevenue: "Monthly Revenue from AI",
  aiExperience: "AI Experience",
  biggestBlocker: "Biggest Blocker",
  whyIn: "Why They Want In",
  referralSource: "Referral Source",
  referralName: "Referrer Name",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvEscape(value: string | null | undefined): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function leadsToCsv(leads: Lead[]): string {
  const header = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Submitted At",
    "Role",
    "Primary Platform",
    "Monthly Revenue",
    "AI Experience",
    "Referral Source",
    "Referrer Name",
    "AI Use",
    "Biggest Blocker",
    "Why In",
  ].join(",");

  const rows = leads.map((l) => {
    const a = l.application;
    return [
      l.firstName,
      l.lastName,
      l.email,
      l.phone,
      l.createdAt,
      a?.role ?? "",
      a?.primaryPlatform ?? "",
      a?.monthlyRevenue ?? "",
      a?.aiExperience ?? "",
      a?.referralSource ?? "",
      a?.referralName ?? "",
      a?.aiUse ?? "",
      a?.biggestBlocker ?? "",
      a?.whyIn ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  return [header, ...rows].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialLeads;
    return initialLeads.filter((l) =>
      [l.firstName, l.lastName, l.email, l.phone, l.application?.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [initialLeads, query]);

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onExport = () => {
    const csv = leadsToCsv(filtered);
    const stamp = new Date().toISOString().split("T")[0];
    downloadCsv(`run-the-ai-play-leads-${stamp}.csv`, csv);
  };

  const onLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Top bar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operator Console</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
            <Users size={14} />
            {initialLeads.length} total applications
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role…"
              className="input-base !py-2.5 !pl-9 sm:w-72"
            />
          </div>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.08]"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="grid grid-cols-[1.4fr_1.8fr_1.1fr_1.2fr_0.9fr_40px] items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Role</div>
          <div>Submitted</div>
          <div />
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-white/45">
            No applications match your filter yet.
          </div>
        )}

        <ul className="divide-y divide-white/[0.04]">
          {filtered.map((lead) => {
            const isOpen = expanded.has(lead.id);
            return (
              <li key={lead.id} className="group">
                <button
                  onClick={() => toggleRow(lead.id)}
                  className="grid w-full grid-cols-[1.4fr_1.8fr_1.1fr_1.2fr_0.9fr_40px] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div className="font-medium text-white">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Mail size={13} className="text-white/35" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Phone size={13} className="text-white/35" />
                    <span className="truncate">{lead.phone}</span>
                  </div>
                  <div className="truncate text-sm text-white/70">
                    {lead.application?.role ?? "—"}
                  </div>
                  <div className="text-sm text-white/55">
                    {formatDate(lead.createdAt)}
                  </div>
                  <div className="flex justify-end">
                    <ChevronDown
                      size={16}
                      className={`text-white/40 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.04] bg-black/30 px-5 py-5">
                        {!lead.application ? (
                          <p className="text-sm text-white/45">
                            No application data on file.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {(
                              Object.keys(FIELD_LABELS) as Array<
                                keyof Application
                              >
                            ).map((key) => {
                              const value = lead.application![key];
                              if (!value) return null;
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                                >
                                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cyan-brand">
                                    {FIELD_LABELS[key]}
                                  </p>
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                                    {value}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
