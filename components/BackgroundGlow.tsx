"use client";

import { motion } from "framer-motion";

/**
 * Cinematic background:
 *  - Pure void black base (#050505)
 *  - Slow animated mesh gradient (CSS @keyframes mesh-drift in globals.css)
 *  - Two large drifting orbs (Framer Motion) for organic depth
 *  - Faint SVG noise overlay for film grain
 */
export function BackgroundGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Animated mesh gradient base */}
      <div className="absolute inset-0 mesh-bg" />

      {/* Drifting orb — deep indigo */}
      <motion.div
        className="absolute h-[680px] w-[680px] rounded-full bg-indigo-brand/25 blur-[140px]"
        initial={{ x: "-20%", y: "-10%" }}
        animate={{
          x: ["-20%", "10%", "-15%", "-20%"],
          y: ["-10%", "20%", "5%", "-10%"],
        }}
        transition={{
          duration: 32,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Drifting orb — dark emerald */}
      <motion.div
        className="absolute right-0 bottom-0 h-[640px] w-[640px] rounded-full bg-emerald-700/25 blur-[140px]"
        initial={{ x: "20%", y: "20%" }}
        animate={{
          x: ["20%", "-10%", "15%", "20%"],
          y: ["20%", "-5%", "10%", "20%"],
        }}
        transition={{
          duration: 36,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Subtle cyan accent orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-brand/12 blur-[120px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Vignette to focus center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(5,5,5,0.85) 100%)",
        }}
      />

      {/* Film-grain noise */}
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
}

export default BackgroundGlow;
