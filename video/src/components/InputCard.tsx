import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS, SPRING_CONFIG } from "../constants";

type InputCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delayFrames: number;
};

export const InputCard: React.FC<InputCardProps> = ({
  icon,
  title,
  subtitle,
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
        transform: `translateY(${(1 - entrance) * -50}px)`,
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: 280,
      }}
    >
      <div style={{ color: COLORS.indigo, flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.text,
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 400 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};
