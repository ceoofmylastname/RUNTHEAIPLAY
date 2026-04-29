"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const TEXT = "Join the free community";

// ─────────────────────────────────────────────────────────
// Per-letter wave animation
// ─────────────────────────────────────────────────────────
// Each letter rotates a full 360° around the Y axis with a staggered
// start, so the rotation reads as a continuous wave traveling left-to-
// right across the headline.
//
// Math note: framer-motion's `delay` applies only to the FIRST iteration;
// subsequent loops use `repeatDelay`. To keep a perfectly stable wave
// (where every letter's nth rotation lands at i*STAGGER + n*CYCLE), each
// letter's repeatDelay must equal (cycle - duration).
const STAGGER = 0.11;
const DURATION = 1.55;
const REST_AFTER_WAVE = 1.4;

// Lerp HSL across the brand palette so each letter has its own subtle
// tint — letters at the start are indigo, middle are cyan, end are
// emerald. Keeps motion (rotation) as the primary visual focus.
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
  // Split into words so each word can be marked `inline-block` —
  // that prevents letters within a single word from ending up on
  // separate lines when the headline wraps on narrow viewports.
  // Words themselves can still wrap to new lines naturally.
  const words = TEXT.split(" ");
  const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
  const totalWaveTime = (totalLetters - 1) * STAGGER + DURATION;
  const cycle = totalWaveTime + REST_AFTER_WAVE;

  // Pre-compute the global letter index for each (word, letter) pair so
  // the rotation stagger flows continuously across word boundaries.
  let runningIdx = 0;
  const letterIndex: number[][] = words.map((word) =>
    Array.from(word).map(() => runningIdx++)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: EASE }}
      className="relative w-full text-center"
    >
      <h1
        aria-label={TEXT}
        className={[
          "font-hero uppercase",
          // Responsive size that reads clean on tiny phones (1.75rem floor)
          // through 4K (5.5rem ceiling) — uses cqw fallback to vw because
          // CAPS at 800 weight occupies more space than mixed case.
          "text-[clamp(1.75rem,8.5vw,5.5rem)]",
          "leading-[0.92] tracking-[-0.035em]",
          // Modern CSS that asks the browser to balance line breaks for
          // visual harmony (e.g., 'JOIN THE FREE / COMMUNITY' instead of
          // 'JOIN THE / FREE COMMUNITY'). Falls back gracefully where
          // unsupported.
          "[text-wrap:balance]",
          // Horizontal padding so the wide font's 115% stretch never
          // overflows on the smallest mobile viewports.
          "px-2 sm:px-0",
        ].join(" ")}
        style={{
          fontWeight: 800,
          fontStretch: "115%",
          fontVariationSettings: '"wdth" 115, "wght" 800, "opsz" 96',
        }}
      >
        {words.map((word, wi) => {
          const isLastWord = wi === words.length - 1;
          return (
            <Fragment key={wi}>
              {/* Each WORD is its own inline-block, so the browser can't
                  break individual letters of 'COMMUNITY' onto separate
                  lines. The whole word goes to a new line as a unit. */}
              <span className="inline-block">
                {Array.from(word).map((char, ci) => {
                  const i = letterIndex[wi][ci];
                  const t = totalLetters > 1 ? i / (totalLetters - 1) : 0;
                  return (
                    <motion.span
                      key={ci}
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
                        color: colorFor(t),
                        textShadow: EXTRUSION_SHADOW,
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
              {/* Plain text space between words → THIS is the only place
                  the browser is allowed to wrap. */}
              {!isLastWord && " "}
            </Fragment>
          );
        })}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
        className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.32em] text-cyan-brand/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-xs"
      >
        · Operators only · Cohort 01 ·
      </motion.p>
    </motion.div>
  );
}

export default HeroHeadline;
