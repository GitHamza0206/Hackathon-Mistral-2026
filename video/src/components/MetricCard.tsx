import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "../constants";

type MetricCardProps = {
  value: string;
  label: string;
  color: string;
  delayFrames: number;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  color,
  delayFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: SPRING_CONFIG,
  });

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 40}px) scale(${0.9 + entrance * 0.1})`,
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: 220,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 16,
          color: COLORS.muted,
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
};
