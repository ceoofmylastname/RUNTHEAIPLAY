"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  showArrow?: boolean;
};

/**
 * 3D button:
 *  - Cyan→emerald gradient face
 *  - Inset highlight on top edge + soft inner shadow on bottom for sculpted depth
 *  - Soft cyan back-shadow for "lifted off the page" feel
 *  - Light magnetic pull toward cursor (no rotating border)
 *  - Spring-scale on hover, presses down on tap
 */
export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  showArrow = true,
}: PrimaryButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const max = 8;
    mx.set(dx * max);
    my.set(dy * max);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      disabled={disabled}
      style={{ x, y }}
      whileHover={disabled ? {} : { scale: 1.025, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.97, y: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={[
        "group relative inline-flex items-center justify-center gap-2",
        "rounded-2xl px-7 py-3.5",
        "text-[15px] font-semibold text-white",
        "select-none",
        // Gradient face
        "bg-[linear-gradient(180deg,#22D3EE_0%,#06B6D4_45%,#10B981_100%)]",
        // 3D sculpting: top highlight + bottom inner shadow
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.25),0_10px_28px_-6px_rgba(6,182,212,0.55),0_18px_36px_-12px_rgba(16,185,129,0.45)]",
        "transition-shadow duration-200",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-2px_0_rgba(0,0,0,0.25),0_14px_36px_-6px_rgba(6,182,212,0.65),0_22px_44px_-12px_rgba(16,185,129,0.55)]",
      ].join(" ")}
    >
      {/* subtle top glossy highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-t-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0))]"
      />
      <span className="relative z-10">{children}</span>
      {showArrow && (
        <ArrowRight
          size={18}
          className="relative z-10 transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </motion.button>
  );
}

export default PrimaryButton;
