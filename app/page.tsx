import Logo from "@/components/Logo";
import WaitlistForm from "@/components/WaitlistForm";
import HeroHeadline from "@/components/HeroHeadline";
import { WebGLShader } from "@/components/ui/web-gl-shader";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Animated WebGL chromatic-aberration shader (fixed full-viewport).
          Renders pure matte black everywhere except the moving brand-color
          streak, so the background stays dark and only the wave brings light. */}
      <WebGLShader />

      {/* Subtle film grain on top — preserves the matte-black feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] noise-overlay"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo size={36} />
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.22em] text-white/55 backdrop-blur-md sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Cohort 01 — Open
        </div>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-96px)] flex-col items-center justify-center gap-10 px-6 pb-16 pt-4 sm:gap-12 sm:px-10">
        <HeroHeadline />
        <WaitlistForm />
      </section>
    </main>
  );
}
