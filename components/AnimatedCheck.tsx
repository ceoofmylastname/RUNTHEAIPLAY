"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Self-drawing checkmark inside a gradient ring.
 * Both the ring and the check stroke are animated with pathLength.
 */
export function AnimatedCheck({ size = 96 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer halo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-emerald-500/35 blur-3xl animate-pulse-glow"
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="check-grad" x1="0" y1="100" x2="100" y2="0">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Background ring (subtle) */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
          fill="none"
        />

        {/* Animated gradient ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#check-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ transformOrigin: "50% 50%", rotate: -90 }}
        />

        {/* Check stroke */}
        <motion.path
          d="M30 52 L45 67 L72 38"
          stroke="url(#check-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.55, delay: 0.55, ease: EASE },
            opacity: { duration: 0.15, delay: 0.55 },
          }}
          style={{
            filter: "drop-shadow(0 0 10px rgba(16,185,129,0.7))",
          }}
        />
      </svg>
    </div>
  );
}

export default AnimatedCheck;
