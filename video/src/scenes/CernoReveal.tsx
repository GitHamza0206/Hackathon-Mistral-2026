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

  // Duration: 270 frames
  const logoEntrance = spring({
    frame: frame - 20,
    fps,
    config: SPRING_CONFIG,
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.88, 1], CLAMP);

  const taglineOpacity = interpolate(frame, [80, 110], [0, 1], CLAMP);

  // Four tagline items, staggered
  const tag1 = interpolate(frame, [120, 140], [0, 1], CLAMP);
  const tag2 = interpolate(frame, [140, 160], [0, 1], CLAMP);
  const tag3 = interpolate(frame, [160, 180], [0, 1], CLAMP);
  const tag4 = interpolate(frame, [180, 200], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Logo — much bigger */}
      <div
        style={{
          opacity: logoEntrance,
          transform: `scale(${logoScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -60,
        }}
      >
        <CernoLogo scale={1.1} />
      </div>

      {/* Tagline — bigger */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          textAlign: "center",
          opacity: taglineOpacity,
        }}
      >
        <div
          style={{
            fontSize: 42,
            fontWeight: 500,
            color: COLORS.text,
          }}
        >
          Automated technical interviews.
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            color: COLORS.muted,
            marginTop: 12,
          }}
        >
          For AI, ML, Data & Software Engineering.
        </div>
      </div>

      {/* Signal tagline — staggered, bigger */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          textAlign: "center",
          display: "flex",
          gap: 40,
          justifyContent: "center",
        }}
      >
        <div style={{ opacity: tag1, fontSize: 24, fontWeight: 400, color: COLORS.muted }}>
          No scheduling.
        </div>
        <div style={{ opacity: tag2, fontSize: 24, fontWeight: 400, color: COLORS.muted }}>
          No unconscious bias.
        </div>
        <div style={{ opacity: tag3, fontSize: 24, fontWeight: 400, color: COLORS.muted }}>
          No inconsistency.
        </div>
        <div style={{ opacity: tag4, fontSize: 24, fontWeight: 600, color: COLORS.lavender }}>
          Just signal.
        </div>
      </div>
    </AbsoluteFill>
  );
};
