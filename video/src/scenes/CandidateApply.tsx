import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockApplyForm } from "../components/MockApplyForm";

export const CandidateApply: React.FC = () => {
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
      <BrowserFrame url="app.cerno.ai/apply/role_ml42" delayFrames={5}>
        <MockApplyForm />
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
        Apply in 60 seconds.{" "}
        <span style={{ color: COLORS.lavender }}>Interview in the next hours.</span>
      </p>
    </AbsoluteFill>
  );
};
