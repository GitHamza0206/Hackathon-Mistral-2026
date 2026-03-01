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

  // "Let's change this." appears first
  const introOpacity = interpolate(frame, [5, 20], [0, 1], CLAMP);
  const introY = interpolate(frame, [5, 20], [15, 0], CLAMP);
  const introFadeOut = interpolate(frame, [45, 55], [1, 0], CLAMP);

  // Logo entrance after intro fades
  const logoEntrance = spring({
    frame: frame - 55,
    fps,
    config: SPRING_CONFIG,
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.85, 1], CLAMP);

  // Glow burst behind logo
  const glowScale = interpolate(frame, [55, 75, 100], [0, 1.8, 1.2], CLAMP);
  const glowOpacity = interpolate(frame, [55, 75, 120], [0, 0.4, 0.12], CLAMP);

  const taglineOpacity = interpolate(frame, [85, 105], [0, 1], CLAMP);
  const taglineY = interpolate(frame, [85, 105], [15, 0], CLAMP);

  const PILLS = ["No scheduling", "No unconscious bias", "No inconsistency", "Just signal"];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* "Let's change this." intro text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateY(${introY}px)`,
          opacity: introOpacity * introFadeOut,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          Let's{" "}
          <span style={{ color: COLORS.indigo }}>change</span>{" "}
          this.
        </p>
      </div>

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
            fontSize: 44,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          AI interviews that actually{" "}
          <span style={{ color: COLORS.lavender }}>listen</span>.
        </div>
      </div>

      {/* Feature pills */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          display: "flex",
          gap: 18,
          justifyContent: "center",
        }}
      >
        {PILLS.map((pill, i) => {
          const pillDelay = 110 + i * 12;
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
                transform: `translateY(${interpolate(pillEntrance, [0, 1], [12, 0])}px)`,
                fontSize: 20,
                fontWeight: isLast ? 700 : 500,
                color: isLast ? COLORS.indigo : COLORS.muted,
                padding: "8px 20px",
                borderRadius: 20,
                border: `1px solid ${isLast ? COLORS.indigo + "40" : COLORS.border}`,
                background: isLast ? COLORS.indigo + "10" : "transparent",
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
