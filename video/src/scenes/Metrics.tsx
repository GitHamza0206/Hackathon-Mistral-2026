import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Clock, Users, Scale } from "lucide-react";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";

const OUTCOMES = [
  {
    icon: Clock,
    title: "Faster screening",
    description:
      "Candidates move through rounds in hours, not weeks. Your pipeline never stalls waiting for a calendar slot.",
    tint: COLORS.indigo,
  },
  {
    icon: Users,
    title: "More candidates, truly evaluated",
    description:
      "Every applicant gets a real interview — not a keyword filter. The talent pool you actually see expands dramatically.",
    tint: COLORS.violet,
  },
  {
    icon: Scale,
    title: "Fairer, every time",
    description:
      "Same rigorous process for every candidate. Competence replaces credentials. No unconscious bias in screening.",
    tint: COLORS.lavender,
  },
];

export const Metrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 420 frames
  const titleEntrance = spring({ frame: frame - 5, fps, config: SPRING_CONFIG });
  const closingOpacity = interpolate(frame, [330, 370], [0, 1], CLAMP);
  const exitOpacity = interpolate(frame, [390, 415], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          textAlign: "center",
          opacity: titleEntrance,
          transform: `translateY(${(1 - titleEntrance) * 20}px)`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>
          The outcome.
        </div>
      </div>

      {/* 3 outcome cards — staggered */}
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          marginTop: 40,
          padding: "0 100px",
        }}
      >
        {OUTCOMES.map((outcome, i) => {
          const entrance = spring({
            frame: frame - 50 - i * 40,
            fps,
            config: SPRING_CONFIG,
          });

          const Icon = outcome.icon;

          return (
            <div
              key={i}
              style={{
                opacity: entrance,
                transform: `translateY(${(1 - entrance) * 50}px)`,
                background: `${outcome.tint}08`,
                border: `1px solid ${outcome.tint}25`,
                borderRadius: 20,
                padding: "40px 36px",
                flex: 1,
                maxWidth: 420,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 20,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `${outcome.tint}15`,
                  border: `2px solid ${outcome.tint}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={30} color={outcome.tint} />
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.text,
                  lineHeight: 1.3,
                }}
              >
                {outcome.title}
              </div>

              <div
                style={{
                  fontSize: 17,
                  fontWeight: 400,
                  color: COLORS.muted,
                  lineHeight: 1.6,
                }}
              >
                {outcome.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing line */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          textAlign: "center",
          opacity: closingOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.text,
            fontStyle: "italic",
          }}
        >
          Fairer for candidates. Faster for teams.
        </div>
      </div>
    </AbsoluteFill>
  );
};
