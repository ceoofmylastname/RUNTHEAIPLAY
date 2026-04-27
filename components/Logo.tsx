import React from "react";

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
  size?: number;
};

const GRADIENT_ID = "rtap-brand-gradient";
const TEXT_GRADIENT_ID = "rtap-text-gradient";

export function Logo({ className = "", iconOnly = false, size = 40 }: LogoProps) {
  const height = size;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={height}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Run The AI Play"
        role="img"
      >
        <defs>
          <linearGradient
            id={GRADIENT_ID}
            x1="0"
            y1="64"
            x2="64"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Outer hex frame (subtle) */}
        <path
          d="M32 3 L57 17 V47 L32 61 L7 47 V17 Z"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.25"
          strokeOpacity="0.45"
          fill="none"
        />

        {/* Forward-leaning play triangle */}
        <path
          d="M22 16 L50 30 L26 48 Z"
          fill={`url(#${GRADIENT_ID})`}
        />

        {/* Neural circuit lines emerging from triangle tip */}
        <line
          x1="50"
          y1="30"
          x2="58"
          y2="22"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="30"
          x2="60"
          y2="32"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="30"
          x2="56"
          y2="40"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Neural nodes */}
        <circle cx="58" cy="22" r="2.4" fill="#10B981" />
        <circle cx="60" cy="32" r="2.4" fill="#06B6D4" />
        <circle cx="56" cy="40" r="2.4" fill="#4F46E5" />

        {/* Inner accent line — circuit feeding into triangle */}
        <line
          x1="6"
          y1="32"
          x2="22"
          y2="32"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="1.25"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
        <circle cx="6" cy="32" r="1.8" fill="#4F46E5" />
      </svg>

      {!iconOnly && (
        <svg
          height={height * 0.55}
          viewBox="0 0 280 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={TEXT_GRADIENT_ID}
              x1="0"
              y1="36"
              x2="60"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id={`${TEXT_GRADIENT_ID}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <text
            x="0"
            y="26"
            fill="#FFFFFF"
            fontFamily="Space Grotesk, Inter, system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="24"
            letterSpacing="-0.6"
          >
            Run The
          </text>
          <text
            x="100"
            y="26"
            fill={`url(#${TEXT_GRADIENT_ID})`}
            fontFamily="Space Grotesk, Inter, system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="24"
            letterSpacing="-0.6"
            filter={`url(#${TEXT_GRADIENT_ID}-glow)`}
          >
            AI
          </text>
          <text
            x="138"
            y="26"
            fill="#FFFFFF"
            fontFamily="Space Grotesk, Inter, system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="24"
            letterSpacing="-0.6"
          >
            Play
          </text>
        </svg>
      )}
    </div>
  );
}

export default Logo;
