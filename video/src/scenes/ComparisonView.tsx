import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockComparison } from "../components/MockComparison";

export const ComparisonView: React.FC = () => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [180, 200], [0, 1], CLAMP);
  const captionY = interpolate(frame, [180, 200], [10, 0], CLAMP);

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
      <BrowserFrame url="app.cerno.ai/admin/interviews/role_ml42" delayFrames={5}>
        <MockComparison />
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
        Compare. Decide.{" "}
        <span style={{ color: COLORS.violet }}>Move fast.</span>
      </p>
    </AbsoluteFill>
  );
};
