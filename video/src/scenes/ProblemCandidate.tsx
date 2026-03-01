import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { User, Hourglass } from "lucide-react";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";
import { SpeechBubble } from "../components/SpeechBubble";

const BUBBLES = [
  "We'll be in touch.",
  "We'll keep your CV on file.",
  "We've decided to go in a different direction.",
];

export const ProblemCandidate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 210 frames
  const candidateEntrance = spring({
    frame: frame - 10,
    fps,
    config: SPRING_CONFIG,
  });

  // Hourglass rotation
  const hourglassRotation = interpolate(
    frame % 70,
    [0, 35, 70],
    [0, 180, 180],
    CLAMP,
  );

  // Cycling speech bubbles
  const bubble1Opacity = interpolate(frame, [20, 30, 60, 68], [0, 1, 1, 0], CLAMP);
  const bubble2Opacity = interpolate(frame, [72, 82, 110, 118], [0, 1, 1, 0], CLAMP);
  const bubble3Opacity = interpolate(frame, [122, 132, 155, 163], [0, 1, 1, 0], CLAMP);

  const headlineOpacity = interpolate(frame, [60, 85], [0, 1], CLAMP);
  const subtextOpacity = interpolate(frame, [85, 110], [0, 1], CLAMP);

  // Exit
  const exitOpacity = interpolate(frame, [185, 207], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Candidate icon + hourglass */}
      <div
        style={{
          opacity: candidateEntrance,
          transform: `scale(${candidateEntrance})`,
          display: "flex",
          alignItems: "center",
          gap: 40,
          position: "absolute",
          top: 220,
        }}
      >
        <User size={80} color={COLORS.lavender} strokeWidth={1.3} />
        <div style={{ transform: `rotate(${hourglassRotation}deg)` }}>
          <Hourglass size={48} color={COLORS.muted} strokeWidth={1.3} />
        </div>
      </div>

      {/* Speech bubbles */}
      <div
        style={{
          position: "absolute",
          top: 360,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ opacity: bubble1Opacity }}>
          <SpeechBubble text={BUBBLES[0]} side="left" />
        </div>
        <div style={{ opacity: bubble2Opacity }}>
          <SpeechBubble text={BUBBLES[1]} side="left" />
        </div>
        <div style={{ opacity: bubble3Opacity }}>
          <SpeechBubble text={BUBBLES[2]} side="left" />
        </div>
      </div>

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          textAlign: "center",
          opacity: headlineOpacity,
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>
          <span style={{ color: COLORS.lavender }}>Great engineers</span>,
          filtered out
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.text,
            marginTop: 4,
          }}
        >
          before anyone talks to them.
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: COLORS.muted,
            marginTop: 20,
            opacity: subtextOpacity,
          }}
        >
          Wrong keywords. Wrong school. Wrong timezone.
        </div>
      </div>
    </AbsoluteFill>
  );
};
