import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockScorecard } from "../components/MockScorecard";

export const AdminScorecard: React.FC = () => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [140, 160], [0, 1], CLAMP);
  const captionY = interpolate(frame, [140, 160], [10, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <BrowserFrame url="app.cerno.ai/admin/sessions/sess_8f3k2" delayFrames={5}>
        <MockScorecard />
      </BrowserFrame>

      <p
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.text,
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        Dimensional scoring. Instant insights.{" "}
        <span style={{ color: COLORS.indigo }}>One-click decisions.</span>
      </p>
    </AbsoluteFill>
  );
};
