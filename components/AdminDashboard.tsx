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

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  answers: {
    aiWebsites: string;
    knowledge: string;
    copywriting: string;
    dataSystems: string;
    bigPicture: string;
  } | null;
};

const QUESTION_LABELS: Record<keyof NonNullable<Lead["answers"]>, string> = {
  aiWebsites: "AI Websites — Traditional vs AI-native",
  knowledge: "Knowledge & Note-Taking",
  copywriting: "Copywriting & Execution Environment",
  dataSystems: "Data & Systems",
  bigPicture: "Big Picture — Goal for AI in Marketing",
};

const QUESTION_OPTIONS: Record<
  keyof NonNullable<Lead["answers"]>,
  Record<"A" | "B" | "C", string>
> = {
  aiWebsites: {
    A: "AI websites are built faster using visual drag-and-drop builders.",
    B: "AI websites have personalized chatbots installed on the homepage.",
    C: "AI websites are structurally engineered with semantic data for LLMs to cite them.",
  },
  knowledge: {
    A: "Paper notebooks and scattered Google Docs.",
    B: "Basic linear note-takers (Apple Notes, Google Keep, Evernote).",
    C: "An interconnected knowledge base (like Obsidian) to map contextual relationships.",
  },
  copywriting: {
    A: "I ask standard ChatGPT to write the whole thing for me.",
    B: "I use Claude Chat for basic formatting and tone adjustments.",
    C: "I use advanced environments like Claude Co-work or Claude Code to build and refine specific frameworks.",
  },
  dataSystems: {
    A: "I don't. That's too technical for me.",
    B: "I use no-code tools like Zapier or Make to connect basic apps.",
    C: "I run custom Python scripts in Jupyter Notebooks or use agentic coding tools.",
  },
  bigPicture: {
    A: "Generating endless amounts of blog posts and social media content.",
    B: "Firing my current team to save money on payroll.",
    C: "Building automated systems that scale revenue and client fulfillment without scaling headcount.",
  },
};

function technicalScore(a: Lead["answers"]): number {
  if (!a) return 0;
  const map: Record<string, number> = { A: 0, B: 1, C: 2 };
  return (
    (map[a.aiWebsites] ?? 0) +
    (map[a.knowledge] ?? 0) +
    (map[a.copywriting] ?? 0) +
    (map[a.dataSystems] ?? 0) +
    (map[a.bigPicture] ?? 0)
  );
}

function scoreTier(score: number) {
  // Max score = 10 (5 questions × 2 max)
  if (score >= 8)
    return { label: "Operator", className: "from-green-brand to-cyan-brand" };
  if (score >= 5)
    return { label: "Practitioner", className: "from-cyan-brand to-indigo-brand" };
  return { label: "Beginner", className: "from-indigo-brand to-indigo-brand" };
}

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

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function leadsToCsv(leads: Lead[]): string {
  const header = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Submitted At",
    "Score",
    "AI Websites",
    "Knowledge",
    "Copywriting",
    "Data Systems",
    "Big Picture",
  ].join(",");

  const rows = leads.map((l) => {
    const a = l.answers;
    return [
      l.firstName,
      l.lastName,
      l.email,
      l.phone,
      l.createdAt,
      String(technicalScore(a)),
      a?.aiWebsites ?? "",
      a?.knowledge ?? "",
      a?.copywriting ?? "",
      a?.dataSystems ?? "",
      a?.bigPicture ?? "",
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
      [l.firstName, l.lastName, l.email, l.phone]
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
            {initialLeads.length} total leads
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
              placeholder="Search name, email, phone…"
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
        <div className="grid grid-cols-[1.4fr_1.6fr_1.2fr_0.9fr_0.9fr_40px] items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Submitted</div>
          <div>Score</div>
          <div />
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-white/45">
            No leads match your filter yet.
          </div>
        )}

        <ul className="divide-y divide-white/[0.04]">
          {filtered.map((lead) => {
            const score = technicalScore(lead.answers);
            const tier = scoreTier(score);
            const isOpen = expanded.has(lead.id);
            return (
              <li key={lead.id} className="group">
                <button
                  onClick={() => toggleRow(lead.id)}
                  className="grid w-full grid-cols-[1.4fr_1.6fr_1.2fr_0.9fr_0.9fr_40px] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
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
                  <div className="text-sm text-white/55">
                    {formatDate(lead.createdAt)}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${tier.className} px-2.5 py-1 text-[11px] font-semibold text-white`}
                    >
                      {tier.label} · {score}/8
                    </span>
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
                        {!lead.answers ? (
                          <p className="text-sm text-white/45">
                            No assessment answers recorded.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {(
                              Object.keys(QUESTION_LABELS) as Array<
                                keyof NonNullable<Lead["answers"]>
                              >
                            ).map((key) => {
                              const letter = lead.answers![key] as
                                | "A"
                                | "B"
                                | "C";
                              const text = QUESTION_OPTIONS[key][letter];
                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-brand">
                                    {QUESTION_LABELS[key]}
                                  </p>
                                  <div className="mt-2 flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-[12px] font-bold text-white">
                                      {letter}
                                    </span>
                                    <p className="text-sm leading-snug text-white/85">
                                      {text}
                                    </p>
                                  </div>
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
