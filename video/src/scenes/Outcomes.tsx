import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Zap, Users, Scale } from "lucide-react";

const OUTCOMES = [
  {
    icon: Zap,
    headline: "Blazing fast",
    phrase: "From application to scorecard in hours, not weeks.",
    color: COLORS.indigo,
  },
  {
    icon: Users,
    headline: "Every voice heard",
    phrase: "Every applicant gets a real interview — not a keyword filter.",
    color: COLORS.violet,
  },
  {
    icon: Scale,
    headline: "Pure signal",
    phrase: "Same rigorous process. Competence replaces credentials.",
    color: COLORS.green,
  },
];

export const Outcomes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(frame, [5, 25], [0, 1], CLAMP);
  const headlineY = interpolate(frame, [5, 25], [15, 0], CLAMP);

  const closingOpacity = interpolate(frame, [280, 310], [0, 1], CLAMP);
  const closingY = interpolate(frame, [280, 310], [15, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
        padding: 80,
      }}
    >
      <p
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: COLORS.muted,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        The outcome
      </p>

      <div style={{ display: "flex", gap: 40 }}>
        {OUTCOMES.map((outcome, i) => {
          const delay = 20 + i * 35;
          const entrance = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const Icon = outcome.icon;

          return (
            <div
              key={outcome.headline}
              style={{
                flex: 1,
                opacity: entrance,
                transform: `scale(${interpolate(entrance, [0, 1], [0.88, 1])}) translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: "48px 36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: `${outcome.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={36} color={outcome.color} />
              </div>

              <p
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: outcome.color,
                  lineHeight: 1.2,
                }}
              >
                {outcome.headline}
              </p>

              <p style={{ fontSize: 18, color: COLORS.muted, lineHeight: 1.5 }}>
                {outcome.phrase}
              </p>
            </div>
          );
        })}
      </div>

      {/* Closing line */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 500,
          fontStyle: "italic",
          color: COLORS.text,
          opacity: closingOpacity,
          transform: `translateY(${closingY}px)`,
        }}
      >
        Fairer for candidates. Faster for teams.
      </p>
    </AbsoluteFill>
  );
};
