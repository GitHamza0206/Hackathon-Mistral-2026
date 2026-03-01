import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

type WaveFormProps = {
  width?: number;
  height?: number;
  amplitude?: number;
  color?: string;
};

export const WaveForm: React.FC<WaveFormProps> = ({
  width = 600,
  height = 80,
  amplitude = 30,
  color = COLORS.indigo,
}) => {
  const frame = useCurrentFrame();

  const points = Array.from({ length: 120 }, (_, i) => {
    const x = (i / 119) * width;
    const y =
      height / 2 + Math.sin(i / 10 + frame * 0.15) * amplitude;
    return `${x},${y}`;
  }).join(" ");

  const totalLength = width * 1.2;
  const dashOffset = (frame * 3) % totalLength;

  return (
    <svg
      width={width}
      height={height}
      style={{
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${totalLength}`}
        strokeDashoffset={dashOffset}
        opacity={0.5}
      />
    </svg>
  );
};
