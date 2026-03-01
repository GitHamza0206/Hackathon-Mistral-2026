import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockChecklist } from "../components/MockChecklist";

export const CandidateChecklist: React.FC = () => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [130, 150], [0, 1], CLAMP);
  const captionY = interpolate(frame, [130, 150], [10, 0], CLAMP);

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
      <BrowserFrame url="app.cerno.ai/session/sess_8f3k2" delayFrames={5}>
        <MockChecklist />
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
        Mic check. Browser check.{" "}
        <span style={{ color: COLORS.green }}>You're ready.</span>
      </p>
    </AbsoluteFill>
  );
};
