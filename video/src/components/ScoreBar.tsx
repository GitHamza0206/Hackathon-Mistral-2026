import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";

type ScoreBarProps = {
  label: string;
  percentage: number;
  color: string;
  delayFrames: number;
};

export const ScoreBar: React.FC<ScoreBarProps> = ({
  label,
  percentage,
  color,
  delayFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const width = interpolate(
    frame,
    [delayFrames, delayFrames + 20],
    [0, percentage],
    CLAMP,
  );

  const opacity = interpolate(frame, [delayFrames, delayFrames + 10], [0, 1], CLAMP);

  return (
    <div style={{ opacity, marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 400 }}>
          {label}
        </span>
        <span style={{ fontSize: 14, color, fontWeight: 600 }}>
          {Math.round(width)}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 8,
          background: COLORS.bgCard,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
};
