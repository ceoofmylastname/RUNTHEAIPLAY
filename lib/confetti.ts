"use client";

import confetti from "canvas-confetti";

const BRAND_COLORS = ["#06B6D4", "#10B981", "#4F46E5", "#FFFFFF"];

/**
 * Dual-cannon confetti firing simultaneously from both bottom corners,
 * with two staggered follow-up bursts for a cinematic, multi-layered explosion.
 */
export function fireDualConfetti() {
  const baseDefaults = {
    colors: BRAND_COLORS,
    ticks: 220,
    gravity: 0.85,
    scalar: 1.05,
    shapes: ["circle", "square"] as confetti.Shape[],
    zIndex: 9999,
  };

  // Initial blast — both sides
  confetti({
    ...baseDefaults,
    particleCount: 130,
    spread: 70,
    startVelocity: 60,
    angle: 60, // upward-right from left
    origin: { x: 0, y: 0.8 },
  });
  confetti({
    ...baseDefaults,
    particleCount: 130,
    spread: 70,
    startVelocity: 60,
    angle: 120, // upward-left from right
    origin: { x: 1, y: 0.8 },
  });

  // Mid-burst — wider spread
  setTimeout(() => {
    confetti({
      ...baseDefaults,
      particleCount: 80,
      spread: 100,
      startVelocity: 50,
      angle: 65,
      origin: { x: 0, y: 0.85 },
    });
    confetti({
      ...baseDefaults,
      particleCount: 80,
      spread: 100,
      startVelocity: 50,
      angle: 115,
      origin: { x: 1, y: 0.85 },
    });
  }, 220);

  // Final shimmer
  setTimeout(() => {
    confetti({
      ...baseDefaults,
      particleCount: 50,
      spread: 130,
      startVelocity: 35,
      angle: 70,
      origin: { x: 0, y: 0.9 },
    });
    confetti({
      ...baseDefaults,
      particleCount: 50,
      spread: 130,
      startVelocity: 35,
      angle: 110,
      origin: { x: 1, y: 0.9 },
    });
  }, 480);
}
