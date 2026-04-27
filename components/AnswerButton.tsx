"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

type AnswerButtonProps = {
  letter: "A" | "B" | "C";
  label: string;
  selected?: boolean;
  onClick: () => void;
};

const EASE = [0.16, 1, 0.3, 1] as const;

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
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={[
        "group relative w-full text-left",
        "rounded-2xl p-[1.5px]",
        "transition-all duration-300",
        selected
          ? "bg-[linear-gradient(90deg,#06B6D4,#10B981)] shadow-[0_0_28px_-4px_rgba(16,185,129,0.55)]"
          : "bg-white/[0.06] hover:bg-[linear-gradient(90deg,#06B6D4,#10B981)] hover:shadow-[0_0_22px_-6px_rgba(6,182,212,0.45)]",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-4 rounded-[14px] bg-black/55 px-5 py-4 backdrop-blur-md",
          "transition-colors duration-300",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "text-sm font-bold transition-all duration-300",
            selected
              ? "bg-[linear-gradient(90deg,#06B6D4,#10B981)] text-white shadow-[0_0_12px_rgba(16,185,129,0.55)]"
              : "bg-white/[0.06] text-white/70 group-hover:bg-[linear-gradient(90deg,#06B6D4,#10B981)] group-hover:text-white",
          ].join(" ")}
        >
          {selected ? <Check size={16} strokeWidth={3} /> : letter}
        </span>
        <span className="text-[15px] leading-snug text-white/90">{label}</span>
      </div>
    </motion.button>
  );
}

export default AnswerButton;
