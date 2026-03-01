import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";

const WORDS_LINE_1 = ["Stop", "wasting", "time", "in", "interviews"];
const WORDS_LINE_2 = ["see", "what", "candidates", "can", "really", "do"];
const WORDS_LINE_3 = ["before", "you", "meet", "them."];

export const KeyPhrase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitOpacity = interpolate(frame, [155, 180], [1, 0], CLAMP);

  // Dash entrance
  const dashOpacity = interpolate(frame, [65, 75], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: exitOpacity,
        padding: "0 120px",
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.indigo}10, transparent 70%)`,
        }}
      />

      {/* Line 1: "Stop wasting time in interviews" */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {WORDS_LINE_1.map((word, i) => {
          const wordDelay = 10 + i * 5;
          const entrance = spring({
            frame: frame - wordDelay,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          const isHighlight = word === "Stop" || word === "wasting";

          return (
            <span
              key={i}
              style={{
                fontSize: 56,
                fontWeight: isHighlight ? 800 : 500,
                color: isHighlight ? COLORS.text : COLORS.muted,
                opacity: entrance,
                transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Dash */}
      <div
        style={{
          width: 60,
          height: 3,
          background: COLORS.indigo,
          borderRadius: 2,
          opacity: dashOpacity,
        }}
      />

      {/* Line 2: "see what candidates can really do" */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {WORDS_LINE_2.map((word, i) => {
          const wordDelay = 45 + i * 4;
          const entrance = spring({
            frame: frame - wordDelay,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          const isHighlight = word === "really" || word === "do";

          return (
            <span
              key={i}
              style={{
                fontSize: 52,
                fontWeight: isHighlight ? 800 : 500,
                color: isHighlight ? COLORS.indigo : "rgba(255,255,255,0.7)",
                opacity: entrance,
                transform: `translateY(${interpolate(entrance, [0, 1], [15, 0])}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Line 3: "before you meet them." */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        {WORDS_LINE_3.map((word, i) => {
          const wordDelay = 80 + i * 5;
          const entrance = spring({
            frame: frame - wordDelay,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          return (
            <span
              key={i}
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: COLORS.lavender,
                opacity: entrance,
                transform: `translateY(${interpolate(entrance, [0, 1], [15, 0])}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
