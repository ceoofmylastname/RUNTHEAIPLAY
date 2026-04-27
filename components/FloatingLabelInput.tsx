"use client";

import { useId, useState } from "react";

type FloatingLabelInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
};

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  autoFocus,
  className = "",
}: FloatingLabelInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div
      className={[
        "group relative rounded-2xl p-[1.5px] transition-all duration-300",
        focused
          ? "bg-[linear-gradient(90deg,#06B6D4,#10B981)] shadow-[0_0_24px_-4px_rgba(6,182,212,0.45)]"
          : "bg-white/[0.06] hover:bg-white/[0.10]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative rounded-[14px] bg-black/55 backdrop-blur-md",
          "transition-colors duration-300",
        ].join(" ")}
      >
        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-4 origin-left transition-all duration-200 ease-out",
            isFloating
              ? "top-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cyan-brand"
              : "top-1/2 -translate-y-1/2 text-[15px] font-normal text-white/45",
          ].join(" ")}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={[
            "w-full bg-transparent outline-none",
            "px-4 pb-2.5 pt-6 text-[15px] text-white",
            "placeholder:text-transparent",
          ].join(" ")}
          placeholder={label}
        />
      </div>
    </div>
  );
}

export default FloatingLabelInput;
