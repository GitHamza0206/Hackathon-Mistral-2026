import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { FileText, Mic, BarChart3 } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Upload JD", color: COLORS.indigo },
  { icon: Mic, label: "AI Interview", color: COLORS.violet },
  { icon: BarChart3, label: "Scorecard", color: COLORS.green },
];

export const ThreeSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(frame, [5, 25], [0, 1], CLAMP);
  const headlineY = interpolate(frame, [5, 25], [20, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
      }}
    >
      {/* Headline */}
      <p
        style={{
          fontSize: 42,
          fontWeight: 600,
          color: COLORS.text,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          textAlign: "center",
        }}
      >
        From job description to scorecard.{" "}
        <span style={{ color: COLORS.indigo }}>Automatically.</span>
      </p>

      {/* Steps row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {STEPS.map((step, i) => {
          const delay = 30 + i * 25;
          const entrance = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const scale = interpolate(entrance, [0, 1], [0.8, 1]);
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              style={{ display: "flex", alignItems: "center" }}
            >
              {/* Connecting arrow (before steps 2 and 3) */}
              {i > 0 && (
                <svg width={100} height={4} style={{ opacity: entrance }}>
                  <line
                    x1={0}
                    y1={2}
                    x2={80}
                    y2={2}
                    stroke={COLORS.muted}
                    strokeWidth={2}
                    strokeDasharray={80}
                    strokeDashoffset={80 * (1 - entrance)}
                  />
                  <polygon
                    points="80,0 90,2 80,4"
                    fill={COLORS.muted}
                    opacity={entrance}
                  />
                </svg>
              )}

              {/* Step circle + label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  opacity: entrance,
                  transform: `scale(${scale})`,
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${step.color}30, ${step.color}10)`,
                    border: `2px solid ${step.color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={42} color={step.color} />
                </div>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
