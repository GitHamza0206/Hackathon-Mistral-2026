import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Zap, ShieldCheck, Scale } from "lucide-react";

const OUTCOMES = [
  {
    icon: Scale,
    headline: "Pure signal",
    phrase: "Same rigorous process. Competence replaces credentials.",
    color: COLORS.green,
  },
  {
    icon: ShieldCheck,
    headline: "No false negative",
    phrase: "Every brilliant AI engineer gets a real interview.",
    color: COLORS.violet,
  },
  {
    icon: Zap,
    headline: "Blazing fast",
    phrase: "From application to scorecard in hours, not weeks.",
    color: COLORS.indigo,
  },
];

export const Outcomes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(frame, [5, 20], [0, 1], CLAMP);
  const headlineY = interpolate(frame, [5, 20], [12, 0], CLAMP);

  const closingOpacity = interpolate(frame, [130, 155], [0, 1], CLAMP);
  const closingY = interpolate(frame, [130, 155], [12, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
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

      <div style={{ display: "flex", gap: 36 }}>
        {OUTCOMES.map((outcome, i) => {
          const delay = 15 + i * 25;
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
                padding: "44px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 17,
                  background: `${outcome.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={34} color={outcome.color} />
              </div>

              <p
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: outcome.color,
                  lineHeight: 1.2,
                }}
              >
                {outcome.headline}
              </p>

              <p style={{ fontSize: 17, color: COLORS.muted, lineHeight: 1.5 }}>
                {outcome.phrase}
              </p>
            </div>
          );
        })}
      </div>

      {/* Closing line */}
      <p
        style={{
          fontSize: 26,
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
