import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, CLAMP } from "../constants";
import { MockHistogram } from "../components/MockHistogram";
import { MockTimeline } from "../components/MockTimeline";

export const Analytics: React.FC = () => {
  const frame = useCurrentFrame();

  const captionOpacity = interpolate(frame, [140, 160], [0, 1], CLAMP);
  const captionY = interpolate(frame, [140, 160], [10, 0], CLAMP);

  const leftEntrance = interpolate(frame, [5, 30], [0, 1], CLAMP);
  const rightEntrance = interpolate(frame, [15, 40], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "40px 60px",
      }}
    >
      {/* Title */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          opacity: interpolate(frame, [0, 15], [0, 1], CLAMP),
        }}
      >
        Analytics dashboard
      </p>

      {/* Charts row — full width */}
      <div
        style={{
          display: "flex",
          gap: 40,
          width: "100%",
          flex: 1,
          maxHeight: 650,
        }}
      >
        {/* Left: Histogram */}
        <div
          style={{
            flex: 1,
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 20,
            padding: "32px 36px",
            opacity: leftEntrance,
            transform: `translateY(${interpolate(leftEntrance, [0, 1], [20, 0])}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MockHistogram />
        </div>

        {/* Right: Timeline */}
        <div
          style={{
            flex: 1,
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 20,
            padding: "32px 36px",
            opacity: rightEntrance,
            transform: `translateY(${interpolate(rightEntrance, [0, 1], [20, 0])}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MockTimeline />
        </div>
      </div>

      {/* Caption */}
      <p
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: COLORS.text,
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        Score distributions. Session timelines.{" "}
        <span style={{ color: COLORS.indigo }}>Data-driven hiring.</span>
      </p>
    </AbsoluteFill>
  );
};
