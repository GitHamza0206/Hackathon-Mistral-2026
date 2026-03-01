import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { CLAMP } from "../constants";

type CernoLogoProps = {
  scale?: number;
};

export const CernoLogo: React.FC<CernoLogoProps> = ({ scale = 1 }) => {
  const frame = useCurrentFrame();

  // Animate the wave bar heights using frame instead of CSS animations
  const wave1 = 76 + Math.sin(frame * 0.1) * 8;
  const wave2 = 56 + Math.sin(frame * 0.11 + 1) * 8;
  const wave3 = 36 + Math.sin(frame * 0.09 + 2) * 6;
  const wave4 = 56 + Math.sin(frame * 0.13 + 0.5) * 7;
  const wave5 = 36 + Math.sin(frame * 0.1 + 1.5) * 7;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 400"
      width={800 * scale}
      height={400 * scale}
    >
      <defs>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#6366F1" }} />
          <stop offset="50%" style={{ stopColor: "#8B5CF6" }} />
          <stop offset="100%" style={{ stopColor: "#A78BFA" }} />
        </linearGradient>
        <linearGradient id="wave" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#6366F1" }} />
          <stop offset="100%" style={{ stopColor: "#A78BFA" }} />
        </linearGradient>
        <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#6366F1", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#A78BFA", stopOpacity: 0.6 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Icon group */}
      <g transform="translate(160, 200)">
        {/* Outer rings */}
        <circle cx="0" cy="0" r="72" fill="none" stroke="url(#ring)" strokeWidth="3" opacity="0.35" />
        <circle cx="0" cy="0" r="56" fill="none" stroke="url(#ring)" strokeWidth="2.5" opacity="0.5" />

        {/* Sound wave bars — animated via frame */}
        <g filter="url(#glow)">
          <rect x="-8" y={-wave1 / 2} width="5" height={wave1} rx="2.5" fill="url(#wave)" opacity="0.95" />
          <rect x="-22" y={-wave2 / 2} width="5" height={wave2} rx="2.5" fill="url(#wave)" opacity="0.85" />
          <rect x="-36" y={-wave3 / 2} width="5" height={wave3} rx="2.5" fill="url(#wave)" opacity="0.7" />

          {/* Center dot */}
          <circle cx="7" cy="0" r="5" fill="url(#accent)" />

          {/* Right bars */}
          <rect x="18" y={-wave4 / 2} width="5" height={wave4} rx="2.5" fill="url(#wave)" opacity="0.85" />
          <rect x="32" y={-wave5 / 2} width="5" height={wave5} rx="2.5" fill="url(#wave)" opacity="0.7" />
        </g>
      </g>

      {/* Wordmark */}
      <g transform="translate(270, 218)">
        <text
          fontFamily="'Inter', 'SF Pro Display', 'Helvetica Neue', sans-serif"
          fontSize="72"
          fontWeight="300"
          letterSpacing="14"
          fill="#EFEFEF"
        >
          CERNO
        </text>
      </g>
    </svg>
  );
};
