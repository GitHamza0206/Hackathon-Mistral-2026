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
import { TypewriterText } from "../components/TypewriterText";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Stop screening." types in then gets strikethrough
  const strikethroughWidth = interpolate(frame, [80, 100], [0, 100], CLAMP);

  // "Start interviewing." fades in bold
  const line2Entrance = spring({
    frame: frame - 110,
    fps,
    config: SPRING_CONFIG,
  });

  // One-liner — highlighted, not muted
  const oneLineOpacity = interpolate(frame, [160, 190], [0, 1], CLAMP);
  const oneLineY = interpolate(frame, [160, 190], [15, 0], CLAMP);

  // Logo — BIGGER
  const logoOpacity = interpolate(frame, [230, 280], [0, 1], CLAMP);
  const logoScale = interpolate(frame, [230, 280], [0.85, 1], CLAMP);

  const urlOpacity = interpolate(frame, [300, 330], [0, 1], CLAMP);

  // Fade to indigo at the very end
  const endOverlay = interpolate(frame, [380, 420], [0, 1], CLAMP);

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
          gap: 0,
        }}
      >
        {/* Line 1: "Stop screening." with strikethrough */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <TypewriterText
            text="Stop screening."
            delayFrames={10}
            charsPerFrame={0.8}
            fontSize={52}
            fontWeight={600}
            color={COLORS.muted}
            cursor={false}
          />
          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikethroughWidth}%`,
              height: 3,
              background: COLORS.appDanger,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Line 2: "Start interviewing." */}
        <div
          style={{
            opacity: line2Entrance,
            transform: `translateY(${interpolate(line2Entrance, [0, 1], [20, 0])}px)`,
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.text,
            lineHeight: 1.3,
          }}
        >
          Start interviewing.
        </div>

        {/* One-liner — HIGHLIGHTED */}
        <div
          style={{
            opacity: oneLineOpacity,
            transform: `translateY(${oneLineY}px)`,
            marginTop: 44,
            maxWidth: 850,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.text,
              lineHeight: 1.6,
            }}
          >
            Every great engineer deserves a{" "}
            <span style={{ color: COLORS.indigo }}>fair shot</span>.
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.text,
              lineHeight: 1.6,
              marginTop: 4,
            }}
          >
            Every recruiter deserves their{" "}
            <span style={{ color: COLORS.lavender }}>time back</span>.
          </p>
        </div>

        {/* Logo — BIGGER */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginTop: 50,
          }}
        >
          <CernoLogo scale={1.3} />
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            marginTop: 24,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.indigo,
            letterSpacing: "0.04em",
          }}
        >
          cerno.ai
        </div>
      </div>

      {/* Fade to indigo overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`,
          opacity: endOverlay,
        }}
      />
    </AbsoluteFill>
  );
};
