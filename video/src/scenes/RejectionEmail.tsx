import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Mail, X } from "lucide-react";

const EMAIL_LINES = [
  { text: "Dear applicant,", delay: 15, isBold: false },
  { text: "", delay: 0, isBold: false },
  { text: "Thank you for your interest in the Senior ML Engineer position.", delay: 30, isBold: false },
  { text: "", delay: 0, isBold: false },
  { text: "After careful consideration, we regret to inform you that", delay: 50, isBold: false },
  { text: "we will not be moving forward with your application.", delay: 60, isBold: true },
  { text: "", delay: 0, isBold: false },
  { text: "We encourage you to apply again in the future.", delay: 80, isBold: false },
  { text: "", delay: 0, isBold: false },
  { text: "Best regards,", delay: 95, isBold: false },
  { text: "The Hiring Team", delay: 100, isBold: false },
];

export const RejectionEmail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emailEntrance = spring({
    frame: frame - 5,
    fps,
    config: SPRING_CONFIG,
  });

  const exitOpacity = interpolate(frame, [125, 150], [1, 0], CLAMP);

  // "No one even read it" text
  const commentOpacity = interpolate(frame, [105, 120], [0, 1], CLAMP);
  const commentY = interpolate(frame, [105, 120], [10, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Email card */}
      <div
        style={{
          opacity: emailEntrance,
          transform: `scale(${interpolate(emailEntrance, [0, 1], [0.9, 1])}) translateY(${interpolate(emailEntrance, [0, 1], [30, 0])}px)`,
          width: 700,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Email header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Mail size={18} color={COLORS.red} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>
              no-reply@company.com
            </div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              Re: Your application — Senior ML Engineer
            </div>
          </div>
          <X size={16} color={COLORS.muted} />
        </div>

        {/* Email body */}
        <div style={{ padding: "24px 28px" }}>
          {EMAIL_LINES.map((line, i) => {
            if (!line.text) return <div key={i} style={{ height: 12 }} />;
            const lineOpacity = interpolate(
              frame,
              [line.delay, line.delay + 8],
              [0, 1],
              CLAMP,
            );

            return (
              <div
                key={i}
                style={{
                  fontSize: 15,
                  fontWeight: line.isBold ? 600 : 400,
                  color: line.isBold ? COLORS.red : "rgba(255,255,255,0.7)",
                  lineHeight: 1.7,
                  opacity: lineOpacity,
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comment below */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          textAlign: "center",
          opacity: commentOpacity,
          transform: `translateY(${commentY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.muted,
            fontStyle: "italic",
          }}
        >
          Automated. Impersonal.{" "}
          <span style={{ color: COLORS.red }}>No one even read it.</span>
        </p>
      </div>
    </AbsoluteFill>
  );
};
