"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 3D-extruded hero headline. Layers:
 *   1. Stacked text-shadow extrusion + soft brand-color glow (CSS class)
 *   2. ::after pseudo-element with bg-clipped gradient that fades in / out
 *      via the gradientPulse keyframe — same rhythm as the form headlines
 *   3. Framer Motion entrance (fade + slide) + continuous gentle float
 *
 * The text only appears once in the DOM (via children) — the gradient
 * overlay reads it from `data-text` so screen readers don't see duplicates.
 */
export function HeroHeadline() {
  const text = "Join the free community";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: EASE }}
      className="relative w-full text-center"
    >
      <motion.h1
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        data-text={text}
        className="three-d-headline inline-block font-display text-[clamp(2.25rem,8vw,5rem)] font-black leading-[0.95] tracking-tight"
      >
        {text}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
        className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-brand/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-xs"
      >
        · Operators only · Cohort 01 ·
      </motion.p>
    </motion.div>
  );
}

export default HeroHeadline;
