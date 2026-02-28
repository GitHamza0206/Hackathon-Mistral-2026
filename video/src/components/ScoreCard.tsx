import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { COLORS, SPRING_CONFIG } from "../constants";
import { ScoreBar } from "./ScoreBar";
import { TagPill } from "./TagPill";

export const ScoreCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  return (
    <div
      style={{
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 80}px)`,
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "28px 36px",
        width: 520,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 13,
          color: COLORS.muted,
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        Round 2 · Technical Assessment
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: COLORS.text,
          marginBottom: 20,
        }}
      >
        Alex Chen — Senior ML Engineer
      </div>

      {/* Score bars */}
      <ScoreBar
        label="ML Fundamentals"
        percentage={91}
        color={COLORS.green}
        delayFrames={10}
      />
      <ScoreBar
        label="System Design"
        percentage={84}
        color={COLORS.indigo}
        delayFrames={16}
      />
      <ScoreBar
        label="Algorithms & Data Structures"
        percentage={78}
        color={COLORS.indigo}
        delayFrames={22}
      />
      <ScoreBar
        label="Code Quality"
        percentage={88}
        color={COLORS.green}
        delayFrames={28}
      />

      {/* Tag pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <TagPill text="Strong: transformer architecture" variant="green" />
        <TagPill text="Strong: distributed systems" variant="green" />
        <TagPill text="Gap: distributed training at scale" variant="amber" />
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div
          style={{
            background: COLORS.green,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 28px",
            borderRadius: 8,
          }}
        >
          ACCEPT
        </div>
        <div
          style={{
            background: COLORS.bgCard,
            color: COLORS.muted,
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 28px",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          REJECT
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: 12,
          color: COLORS.muted,
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Instant scored summary. One-click decision.
      </div>
    </div>
  );
};
