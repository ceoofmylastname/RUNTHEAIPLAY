"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const TEXT = "Join the free community";

// ─────────────────────────────────────────────────────────
// Per-letter wave animation
// ─────────────────────────────────────────────────────────
// Each letter rotates a full 360° around the Y axis with a staggered
// start, so the rotation reads as a continuous wave traveling left-to-
// right across the headline. After every letter has completed, the
// whole sequence pauses (REST_AFTER_WAVE) and then starts over.
//
// Math note: framer-motion's `delay` applies only to the FIRST iteration;
// subsequent loops use `repeatDelay`. To get a perfectly stable wave,
// each letter's repeatDelay must equal (total cycle - duration), so
// every letter fires its nth rotation at i*STAGGER + n*CYCLE.
const STAGGER = 0.11;
const DURATION = 1.55;
const REST_AFTER_WAVE = 1.4;

// Lerp HSL across the brand palette so each letter has its own subtle
// tint — letters at the start are indigo, middle are cyan, end are
// emerald. Adds chromatic depth without animating color, keeping the
// motion (rotation) as the primary visual focus.
function colorFor(t: number): string {
  // Indigo-400  hsl(231, 87%, 76%)
  // Cyan-400    hsl(187, 86%, 53%)
  // Emerald-400 hsl(160, 64%, 53%)
  const h = 231 + (160 - 231) * t;
  const s = 87 + (64 - 87) * t;
  const l = 76 + (53 - 76) * t;
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

const EXTRUSION_SHADOW = `
  0 1px 0 #0a0a0e,
  0 2px 0 #08080c,
  0 3px 0 #060609,
  0 4px 0 #040406,
  0 6px 14px rgba(0, 0, 0, 0.65),
  0 14px 32px rgba(6, 182, 212, 0.28),
  0 24px 60px rgba(16, 185, 129, 0.2)
`;

export function HeroHeadline() {
  const letters = TEXT.split("");
  const total = letters.length;
  // Total cycle = (last letter's start) + duration + rest. Used so each
  // letter's repeatDelay = cycle - duration, regardless of its index.
  const totalWaveTime = (total - 1) * STAGGER + DURATION;
  const cycle = totalWaveTime + REST_AFTER_WAVE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: EASE }}
      className="relative w-full text-center"
    >
      {/* The visible text is broken into per-letter spans for the rotation
          wave. We expose the full string to assistive tech via aria-label
          on the heading and aria-hidden on each letter so screen readers
          read the heading once, normally. */}
      <h1
        aria-label={TEXT}
        className="font-hero text-[clamp(2.5rem,9vw,5.5rem)] leading-[0.95] tracking-[-0.04em]"
        style={{
          fontWeight: 800,
          fontStretch: "115%",
          fontVariationSettings: '"wdth" 115, "wght" 800, "opsz" 96',
        }}
      >
        {letters.map((char, i) => {
          const t = total > 1 ? i / (total - 1) : 0;
          const isSpace = char === " ";
          return (
            <motion.span
              key={i}
              aria-hidden="true"
              animate={{ rotateY: [0, 360] }}
              transition={{
                duration: DURATION,
                delay: i * STAGGER,
                ease: EASE,
                repeat: Infinity,
                repeatDelay: cycle - DURATION,
              }}
              style={{
                display: "inline-block",
                transformStyle: "preserve-3d",
                color: isSpace ? "transparent" : colorFor(t),
                textShadow: isSpace ? "none" : EXTRUSION_SHADOW,
                // Reserve space for spaces (collapsed inline whitespace
                // wouldn't have a width on its own).
                minWidth: isSpace ? "0.32em" : undefined,
              }}
            >
              {isSpace ? " " : char}
            </motion.span>
          );
        })}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
        className="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-brand/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-xs"
      >
        · Operators only · Cohort 01 ·
      </motion.p>
    </motion.div>
  );
}

export default HeroHeadline;
