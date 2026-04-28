"use client";

import { motion } from "framer-motion";

type AnswerButtonProps = {
  letter: "A" | "B" | "C";
  label: string;
  selected?: boolean;
  onClick: () => void;
};

export function AnswerButton({
  letter,
  label,
  selected = false,
  onClick,
}: AnswerButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={selected ? {} : { y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={[
        "group relative flex w-full items-center gap-4 overflow-hidden",
        "rounded-2xl px-5 py-4 text-left",
        "border transition-all duration-200 ease-in-out",
        // Default vs selected base
        selected
          ? [
              // Translucent cyan/green flash
              "bg-[linear-gradient(90deg,rgba(6,182,212,0.18),rgba(16,185,129,0.18))]",
              "border-cyan-brand/70",
              "shadow-[0_0_24px_-2px_rgba(6,182,212,0.55),0_0_44px_-12px_rgba(16,185,129,0.5)]",
            ].join(" ")
          : [
              "bg-white/[0.02]",
              "border-white/10",
              // Hover: lift + cyan border + soft cyan drop-shadow
              "hover:border-cyan-brand",
              "hover:shadow-[0_10px_28px_-10px_rgba(6,182,212,0.55)]",
            ].join(" "),
      ].join(" ")}
    >
      {/* Subtle gradient sweep on selection */}
      {selected && (
        <motion.span
          aria-hidden="true"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "100%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]"
        />
      )}

      {/* Letter / radio badge */}
      <span
        className={[
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          "text-sm font-bold transition-all duration-200 ease-in-out",
          selected
            ? "bg-[linear-gradient(135deg,#06B6D4,#10B981)] text-white shadow-[0_0_18px_rgba(6,182,212,0.7)]"
            : "bg-white/[0.05] text-white/70 group-hover:text-white",
        ].join(" ")}
      >
        {letter}
      </span>

      {/* Label */}
      <span
        className={[
          "relative text-[15px] leading-snug transition-colors duration-200 ease-in-out",
          selected ? "text-white" : "text-white/85 group-hover:text-white",
        ].join(" ")}
      >
        {label}
      </span>

      {/* Right-edge radio indicator */}
      <span
        className={[
          "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          "border transition-all duration-200 ease-in-out",
          selected
            ? "border-cyan-brand bg-[linear-gradient(135deg,#06B6D4,#10B981)] shadow-[0_0_12px_rgba(6,182,212,0.7)]"
            : "border-white/15 bg-transparent group-hover:border-cyan-brand/70",
        ].join(" ")}
      >
        {selected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="block h-2 w-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
          />
        )}
      </span>
    </motion.button>
  );
}

export default AnswerButton;
