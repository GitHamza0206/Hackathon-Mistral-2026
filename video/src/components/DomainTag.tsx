import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";

type DomainTagProps = {
  icon: React.ReactNode;
  label: string;
  subtext: string;
  tint: string;
  delayFrames: number;
  pulseAt: number;
};

export const DomainTag: React.FC<DomainTagProps> = ({
  icon,
  label,
  subtext,
  tint,
  delayFrames,
  pulseAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: SPRING_CONFIG,
  });

  const pulse = interpolate(
    frame,
    [pulseAt, pulseAt + 8, pulseAt + 16],
    [1, 1.06, 1],
    CLAMP,
  );

  return (
    <div
      style={{
        opacity: entrance,
        transform: `scale(${entrance * pulse})`,
        background: `${tint}10`,
        border: `1px solid ${tint}30`,
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: 340,
      }}
    >
      <div style={{ color: tint, flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 400 }}>
          {subtext}
        </div>
      </div>
    </div>
  );
};
