import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Mic, Monitor, Volume2, CheckCircle, Circle } from "lucide-react";

const CHECKS = [
  { icon: Mic, label: "Microphone", passAt: 30, description: "Working" },
  { icon: Monitor, label: "Browser compatibility", passAt: 55, description: "All APIs supported" },
  { icon: Volume2, label: "Quiet environment", passAt: 85, description: "Confirmed" },
];

export const MockChecklist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const allPassed = frame > 85;

  const buttonEntrance = spring({
    frame: frame - 100,
    fps,
    config: SPRING_CONFIG,
  });

  const buttonPulse = allPassed
    ? 0.3 + Math.sin((frame - 100) * 0.15) * 0.2
    : 0;

  return (
    <div style={{ padding: "40px 60px" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Pre-interview checklist
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.appInk, marginTop: 8 }}>
        Let's make sure everything works
      </h2>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        {CHECKS.map((check) => {
          const isPassed = frame >= check.passAt;
          const Icon = check.icon;
          const entrance = interpolate(frame, [check.passAt - 20, check.passAt], [0, 1], CLAMP);

          // Bounce on pass
          const bounce = isPassed
            ? spring({ frame: frame - check.passAt, fps, config: { damping: 10, stiffness: 200 } })
            : 0;
          const scale = isPassed ? 1 + (1 - bounce) * 0.15 : 1;

          return (
            <div
              key={check.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderRadius: 12,
                background: isPassed ? `${COLORS.appSuccess}08` : COLORS.appPanel,
                border: `1px solid ${isPassed ? COLORS.appSuccess + "30" : COLORS.appBorder}`,
                transform: `scale(${scale})`,
                transition: "none",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: isPassed ? `${COLORS.appSuccess}15` : `${COLORS.appAccent}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={isPassed ? COLORS.appSuccess : COLORS.appAccent} />
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.appInk }}>
                  {check.label}
                </p>
                {isPassed && (
                  <p style={{ fontSize: 12, color: COLORS.appSuccess, marginTop: 2 }}>
                    {check.description}
                  </p>
                )}
              </div>

              {/* Status */}
              {isPassed ? (
                <CheckCircle size={22} color={COLORS.appSuccess} />
              ) : (
                <Circle size={22} color={COLORS.appBorder} />
              )}
            </div>
          );
        })}
      </div>

      {/* Start button */}
      <div
        style={{
          marginTop: 28,
          opacity: buttonEntrance,
          transform: `translateY(${interpolate(buttonEntrance, [0, 1], [10, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "14px 32px",
            borderRadius: 12,
            background: allPassed
              ? `linear-gradient(135deg, ${COLORS.appAccent}, ${COLORS.violet})`
              : COLORS.appMuted,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: allPassed
              ? `0 8px 30px ${COLORS.appAccent}${Math.round(buttonPulse * 255).toString(16).padStart(2, "0")}`
              : "none",
          }}
        >
          Start interview →
        </div>
      </div>
    </div>
  );
};
