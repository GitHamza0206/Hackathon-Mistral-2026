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

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 430 frames
  const line1 = spring({
    frame: frame - 30,
    fps,
    config: SPRING_CONFIG,
  });

  const line2Opacity = interpolate(frame, [80, 120], [0, 1], CLAMP);
  const logoOpacity = interpolate(frame, [170, 220], [0, 1], CLAMP);
  const logoScale = interpolate(frame, [170, 220], [0.88, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            opacity: line1,
            transform: `translateY(${(1 - line1) * 30}px)`,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: 1.3,
            maxWidth: 1100,
          }}
        >
          Every great engineer deserves a fair shot.
        </div>

        {/* Line 2 */}
        <div
          style={{
            opacity: line2Opacity,
            fontSize: 30,
            fontWeight: 400,
            color: COLORS.muted,
            marginTop: 28,
            lineHeight: 1.5,
          }}
        >
          And your senior engineers deserve better
          <br />
          than calendar Tetris.
        </div>

        {/* Logo — bigger */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginTop: 70,
          }}
        >
          <CernoLogo scale={0.85} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
