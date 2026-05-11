/**
 * Aurora background for the v2 funnel:
 * - Three large blurred radial-gradient orbs (purple, teal, pink)
 *   each floating slowly on its own keyframe
 * - Faint SVG noise overlay on top for grain texture
 *
 * Pure CSS animation — no React state, no Framer Motion needed.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-funnel-bg"
    >
      {/* Orb 1 — purple, top-right */}
      <div
        className="absolute -top-32 right-[-8%] h-[600px] w-[600px] animate-orb-1 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(139,92,246,0.18) 50%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.7,
        }}
      />
      {/* Orb 2 — teal, bottom-left */}
      <div
        className="absolute -bottom-32 left-[-6%] h-[500px] w-[500px] animate-orb-2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(34,211,238,0.18) 50%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.65,
        }}
      />
      {/* Orb 3 — pink, center-left */}
      <div
        className="absolute left-[-4%] top-1/2 h-[400px] w-[400px] -translate-y-1/2 animate-orb-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(236,72,153,0.15) 50%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.6,
        }}
      />

      {/* Subtle film-grain noise overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          opacity: 0.04,
          mixBlendMode: "overlay",
        }}
      />

      {/* Soft vignette so the center reads cleaner */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,6,12,0) 35%, rgba(6,6,12,0.7) 100%)",
        }}
      />
    </div>
  );
}

export default AuroraBackground;
