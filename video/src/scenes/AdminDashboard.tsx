import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { MockAdminConsole } from "../components/MockAdminConsole";

export const AdminDashboard: React.FC = () => {
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
      <BrowserFrame url="app.cerno.ai/admin" delayFrames={5}>
        <MockAdminConsole />
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
        Every candidate, at a glance.{" "}
        <span style={{ color: COLORS.lavender }}>Table, kanban, your call.</span>
      </p>
    </AbsoluteFill>
  );
};
