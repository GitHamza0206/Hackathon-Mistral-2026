import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";
import { CernoLogo } from "../components/CernoLogo";

export const CernoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 180 frames (6s)
  const logoEntrance = spring({
    frame: frame - 10,
    fps,
    config: SPRING_CONFIG,
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.85, 1], CLAMP);

  // Glow burst behind logo
  const glowScale = interpolate(frame, [10, 30, 60], [0, 1.8, 1.2], CLAMP);
  const glowOpacity = interpolate(frame, [10, 30, 80], [0, 0.4, 0.12], CLAMP);

  const taglineOpacity = interpolate(frame, [50, 70], [0, 1], CLAMP);
  const taglineY = interpolate(frame, [50, 70], [15, 0], CLAMP);

  const PILLS = ["No scheduling", "No unconscious bias", "No inconsistency", "Just signal"];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Glow burst */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.indigo}40, transparent 70%)`,
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
        }}
      />

      {/* Logo */}
      <div
        style={{
          opacity: logoEntrance,
          transform: `scale(${logoScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -80,
        }}
      >
        <CernoLogo scale={1.1} />
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          textAlign: "center",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          AI interviews that actually listen.
        </div>
      </div>

      {/* Feature pills */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          display: "flex",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {PILLS.map((pill, i) => {
          const pillDelay = 80 + i * 15;
          const pillEntrance = spring({
            frame: frame - pillDelay,
            fps,
            config: { damping: 16, stiffness: 100 },
          });
          const isLast = i === PILLS.length - 1;
          return (
            <div
              key={pill}
              style={{
                opacity: pillEntrance,
                transform: `translateY(${interpolate(pillEntrance, [0, 1], [12, 0])})`,
                fontSize: 22,
                fontWeight: isLast ? 700 : 500,
                color: isLast ? COLORS.lavender : COLORS.muted,
                padding: "8px 20px",
                borderRadius: 20,
                border: `1px solid ${isLast ? COLORS.lavender + "40" : COLORS.border}`,
                background: isLast ? COLORS.lavender + "10" : "transparent",
              }}
            >
              {pill}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
