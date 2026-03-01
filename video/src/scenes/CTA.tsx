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

  // Duration: 480 frames (16s)

  // "Stop screening." types in then gets strikethrough
  const strikethroughWidth = interpolate(frame, [80, 100], [0, 100], CLAMP);

  // "Start interviewing." fades in bold
  const line2Entrance = spring({
    frame: frame - 110,
    fps,
    config: SPRING_CONFIG,
  });

  const logoOpacity = interpolate(frame, [200, 250], [0, 1], CLAMP);
  const logoScale = interpolate(frame, [200, 250], [0.88, 1], CLAMP);

  const oneLineOpacity = interpolate(frame, [180, 210], [0, 1], CLAMP);
  const oneLineY = interpolate(frame, [180, 210], [12, 0], CLAMP);

  const urlOpacity = interpolate(frame, [310, 340], [0, 1], CLAMP);

  // Fade to indigo at the very end
  const endOverlay = interpolate(frame, [430, 480], [0, 1], CLAMP);

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

        {/* One-liner */}
        <div
          style={{
            opacity: oneLineOpacity,
            transform: `translateY(${oneLineY}px)`,
            marginTop: 50,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 24,
              fontWeight: 500,
              fontStyle: "italic",
              color: COLORS.muted,
              lineHeight: 1.6,
            }}
          >
            Every great engineer deserves a fair shot.
            <br />
            Every recruiter deserves their time back.
          </p>
        </div>

        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginTop: 40,
          }}
        >
          <CernoLogo scale={0.8} />
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            marginTop: 20,
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.indigo,
            letterSpacing: "0.03em",
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
