import Logo from "@/components/Logo";
import AuroraBackground from "@/components/AuroraBackground";
import FunnelForm from "@/components/FunnelForm";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-funnel-bg text-funnel-text">
      <AuroraBackground />

      {/* Top utility bar — logo + tiny status pill */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10">
        <Logo size={32} />
        <div className="hidden items-center gap-2 rounded-[4px] border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-funnel-muted backdrop-blur-md sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-70"
              style={{ background: "#22d3ee" }}
            />
            <span
              className="relative inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#22d3ee" }}
            />
          </span>
          Live · Cohort 01
        </div>
      </div>

      {/* Global header — JOIN THE FREE COMMUNITY + status line + divider */}
      <section className="relative z-10 mx-auto mt-8 max-w-[900px] px-6 text-center sm:mt-12 sm:px-10">
        <h1
          className="font-hero"
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "0.04em",
            background:
              "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #22d3ee 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          JOIN THE FREE COMMUNITY
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-funnel-muted">
          · Operators Only · Cohort 01 ·
        </p>
        <div
          className="mx-auto mt-7 h-px max-w-[640px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #22d3ee, transparent)",
          }}
        />
      </section>

      {/* Funnel */}
      <section className="relative z-10 mx-auto mt-10 w-full px-6 pb-16 sm:mt-14 sm:px-10">
        <FunnelForm />
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-[900px] px-6 pb-10 text-center sm:px-10">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "#3a3850" }}
        >
          Run The AI Play · Cohort 01 · Operators Only
        </p>
      </footer>
    </main>
  );
}
