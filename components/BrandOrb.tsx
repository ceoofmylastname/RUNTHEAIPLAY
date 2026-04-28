"use client";

import { motion, type MotionValue } from "framer-motion";

const ORB_SIZE = 720;

type BrandOrbProps = {
  /**
   * X offset from the parent's center (in pixels). Driven by the same
   * MotionValue that the WaitlistForm uses to compute textColor, so the
   * visual orb and the text inversion stay perfectly in sync.
   */
  x: MotionValue<number>;
  /** Y offset from the parent's center (in pixels). */
  y: MotionValue<number>;
};

/**
 * Visible brand-color orb. Position is owned by the parent so it can be
 * shared with text-color logic. The parent passes raw offsets (cos/sin
 * of time) and we add our own translate(-50%, -50%) via the negative
 * half-size offsets baked into the transform.
 */
export function BrandOrb({ x, y }: BrandOrbProps) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        x,
        y,
        width: ORB_SIZE,
        height: ORB_SIZE,
        // Center the orb on the parent's middle: top-left starts at (50%, 50%)
        // then we shift back by half the orb size, plus the (x,y) MotionValue.
        marginLeft: -ORB_SIZE / 2,
        marginTop: -ORB_SIZE / 2,
      }}
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-3xl will-change-transform"
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.92) 0%, rgba(16,185,129,0.55) 32%, rgba(6,182,212,0.18) 55%, transparent 72%)",
        }}
      />
    </motion.div>
  );
}

export default BrandOrb;
