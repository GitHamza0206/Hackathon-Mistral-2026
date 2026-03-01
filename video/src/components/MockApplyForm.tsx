import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { TypewriterText } from "./TypewriterText";

export const MockApplyForm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const FIELDS = [
    { label: "Your name", value: "Alex Chen", delay: 30 },
    { label: "GitHub URL", value: "github.com/alexchen", delay: 65 },
    { label: "Upload CV", value: "alex-chen-cv.pdf", delay: 100 },
  ];

  const buttonDelay = 140;
  const buttonEntrance = spring({
    frame: frame - buttonDelay,
    fps,
    config: SPRING_CONFIG,
  });

  // Button glow pulse
  const buttonGlow = frame > buttonDelay + 20
    ? 0.3 + Math.sin((frame - buttonDelay) * 0.12) * 0.15
    : 0;

  return (
    <div style={{ padding: "40px 60px" }}>
      {/* Header */}
      <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Candidate application
      </p>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: COLORS.appInk, marginTop: 8 }}>
        Prepare your screening session
      </h2>

      {/* Role summary bar */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 24,
          padding: "16px 20px",
          background: COLORS.appPanel,
          borderRadius: 12,
          border: `1px solid ${COLORS.appBorder}`,
        }}
      >
        {[
          { label: "Role", value: "Senior ML Engineer" },
          { label: "Level", value: "Senior" },
          { label: "Duration", value: "30 min" },
        ].map((item) => (
          <div key={item.label} style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: COLORS.appMuted, fontWeight: 600, textTransform: "uppercase" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 16, color: COLORS.appInk, fontWeight: 600, marginTop: 4 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Form fields */}
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        {FIELDS.map((field) => {
          const fieldOpacity = interpolate(frame, [field.delay, field.delay + 12], [0, 1], CLAMP);
          return (
            <div key={field.label} style={{ opacity: fieldOpacity }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.appInk, marginBottom: 6 }}>
                {field.label}
              </p>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${COLORS.appBorder}`,
                  background: "#fff",
                  fontSize: 15,
                  color: COLORS.appInk,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TypewriterText
                  text={field.value}
                  delayFrames={field.delay + 8}
                  charsPerFrame={0.6}
                  fontSize={15}
                  color={COLORS.appInk}
                  cursor={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
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
            background: `linear-gradient(135deg, ${COLORS.appAccent}, ${COLORS.violet})`,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: `0 8px 30px ${COLORS.appAccent}${Math.round(buttonGlow * 255).toString(16).padStart(2, "0")}`,
          }}
        >
          Prepare interview →
        </div>
      </div>
    </div>
  );
};
