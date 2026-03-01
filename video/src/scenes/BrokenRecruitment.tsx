import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_SNAPPY } from "../constants";

const LINES = [
  { text: "That's normal.", delay: 10, size: 38, color: COLORS.muted, weight: 500 },
  { text: "That's the case.", delay: 35, size: 38, color: COLORS.muted, weight: 500 },
  { text: "Recruitment is broken.", delay: 65, size: 64, color: COLORS.text, weight: 800 },
  { text: "In both directions.", delay: 95, size: 48, color: COLORS.red, weight: 700 },
];

export const BrokenRecruitment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitOpacity = interpolate(frame, [125, 150], [1, 0], CLAMP);

  // Crack/fracture line in the middle
  const crackProgress = interpolate(frame, [65, 85], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: exitOpacity,
      }}
    >
      {/* Subtle red vignette when "broken" appears */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.red}08 100%)`,
          opacity: interpolate(frame, [65, 80], [0, 1], CLAMP),
          pointerEvents: "none",
        }}
      />

      {/* Text lines */}
      {LINES.map((line, i) => {
        const entrance = spring({
          frame: frame - line.delay,
          fps,
          config: SPRING_SNAPPY,
        });

        return (
          <div
            key={i}
            style={{
              opacity: entrance,
              transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px) scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: line.size,
                fontWeight: line.weight,
                color: line.color,
                lineHeight: 1.3,
              }}
            >
              {line.text}
            </p>
          </div>
        );
      })}

      {/* Fracture line */}
      <svg
        width={400}
        height={4}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: crackProgress * 0.4,
        }}
      >
        <line
          x1={200 - crackProgress * 200}
          y1={2}
          x2={200 + crackProgress * 200}
          y2={2}
          stroke={COLORS.red}
          strokeWidth={2}
        />
      </svg>
    </AbsoluteFill>
  );
};
