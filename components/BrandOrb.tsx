"use client";

import { motion, useTime, useTransform } from "framer-motion";

const ORB_SIZE = 720;

/**
 * Slowly orbits a large, heavily-blurred radial gradient (cyan → emerald)
 * around the form. Self-contained: computes its own position via useTime +
 * useTransform so MotionValues update every frame without re-rendering React.
 *
 * MUST be placed as a SIBLING of the form's content layer (not inside the
 * backdrop-blur glass card) so that mix-blend-exclusion on the content can
 * reach it through the wrapper's stacking context.
 */
export function BrandOrb() {
  const time = useTime();

  // Lissajous orbit: different X/Y periods give a slow, organic figure-eight
  // sweep instead of a perfect circle. Centered on the form (the parent).
  const x = useTransform(time, (t) => Math.cos(t / 5200) * 320);
  const y = useTransform(time, (t) => Math.sin(t / 6800) * 240);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        x,
        y,
        width: ORB_SIZE,
        height: ORB_SIZE,
        marginLeft: -ORB_SIZE / 2,
        marginTop: -ORB_SIZE / 2,
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-3xl will-change-transform"
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.95) 0%, rgba(16,185,129,0.6) 32%, rgba(6,182,212,0.2) 55%, transparent 72%)",
        }}
      />
    </motion.div>
  );
}

export default BrandOrb;
