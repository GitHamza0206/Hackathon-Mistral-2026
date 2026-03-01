import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockInterviewSession } from "../components/MockInterviewSession";

export const LiveInterview: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle zoom into the browser frame over the scene
  const zoomScale = interpolate(frame, [0, 280], [1, 1.03], CLAMP);

  const captionOpacity = interpolate(frame, [240, 265], [0, 1], CLAMP);
  const captionY = interpolate(frame, [240, 265], [10, 0], CLAMP);

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
      <div style={{ transform: `scale(${zoomScale})` }}>
        <BrowserFrame url="app.cerno.ai/session/sess_8f3k2" delayFrames={5}>
          <MockInterviewSession />
        </BrowserFrame>
      </div>

      <p
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.text,
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        A real conversation.{" "}
        <span style={{ color: COLORS.indigo }}>Not a quiz.</span>
      </p>
    </AbsoluteFill>
  );
};
