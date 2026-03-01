import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";

interface BrowserFrameProps {
  url: string;
  children: React.ReactNode;
  scale?: number;
  delayFrames?: number;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  url,
  children,
  scale = 1,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrames,
    fps,
    config: SPRING_CONFIG,
  });

  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(frame, [delayFrames, delayFrames + 12], [0, 1], CLAMP);

  return (
    <div
      style={{
        transform: `scale(${scale * (0.92 + 0.08 * entrance)}) translateY(${translateY}px)`,
        opacity,
        width: 1400,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          background: "#1a1a2e",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "6px 24px",
              fontSize: 13,
              color: COLORS.muted,
              fontWeight: 400,
              letterSpacing: "0.01em",
              maxWidth: 500,
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </div>
        </div>

        {/* Spacer to balance traffic lights */}
        <div style={{ width: 52 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          position: "relative",
          background: COLORS.appBg,
          minHeight: 700,
          overflow: "hidden",
        }}
      >
        {/* Grid overlay (matching the real app's body::before) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(99,102,241,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99,102,241,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Children */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
