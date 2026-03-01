import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";

export const PainPoints: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftEntrance = spring({ frame: frame - 15, fps, config: SPRING_CONFIG });
  const rightEntrance = spring({ frame: frame - 30, fps, config: SPRING_CONFIG });

  const pulse = 0.3 + Math.sin(frame * 0.08) * 0.15;

  const exitOpacity = interpolate(frame, [210, 240], [1, 0], CLAMP);
  const vsOpacity = interpolate(frame, [50, 65], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "row",
        opacity: exitOpacity,
      }}
    >
      {/* LEFT: Companies */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: leftEntrance,
          transform: `translateX(${interpolate(leftEntrance, [0, 1], [-50, 0])}px)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, ${COLORS.indigo}08, transparent 70%)`,
          }}
        />

        {/* Building icon */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            background: `linear-gradient(135deg, ${COLORS.indigo}30, ${COLORS.violet}20)`,
            border: `2px solid ${COLORS.indigo}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
              fill={COLORS.indigo}
              opacity={0.8}
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.text,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 650,
            padding: "0 40px",
          }}
        >
          Tired of{" "}
          <span
            style={{
              color: COLORS.indigo,
              textShadow: `0 0 40px ${COLORS.indigo}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`,
            }}
          >
            missing
          </span>{" "}
          top AI engineers?
        </p>

        <p
          style={{
            fontSize: 18,
            color: COLORS.muted,
            marginTop: 20,
            textAlign: "center",
            maxWidth: 400,
            lineHeight: 1.5,
            opacity: interpolate(frame, [40, 55], [0, 1], CLAMP),
          }}
        >
          500 resumes. 3 reviewers. The best ones slip through.
        </p>
      </div>

      {/* Center VS divider */}
      <div
        style={{
          width: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 2,
            height: "60%",
            background: `linear-gradient(to bottom, transparent, ${COLORS.border}, transparent)`,
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: COLORS.bg,
            border: `2px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: vsOpacity,
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.muted }}>
            VS
          </span>
        </div>
      </div>

      {/* RIGHT: Candidates */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: rightEntrance,
          transform: `translateX(${interpolate(rightEntrance, [0, 1], [50, 0])}px)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, ${COLORS.lavender}08, transparent 70%)`,
          }}
        />

        {/* Person icon */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            background: `linear-gradient(135deg, ${COLORS.lavender}30, ${COLORS.violet}20)`,
            border: `2px solid ${COLORS.lavender}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"
              fill={COLORS.lavender}
              opacity={0.8}
            />
          </svg>
        </div>

        <p
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: COLORS.text,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 600,
            padding: "0 40px",
          }}
        >
          Feeling{" "}
          <span
            style={{
              color: COLORS.lavender,
              textShadow: `0 0 40px ${COLORS.lavender}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`,
            }}
          >
            overlooked
          </span>
          ?
        </p>

        <p
          style={{
            fontSize: 18,
            color: COLORS.muted,
            marginTop: 20,
            textAlign: "center",
            maxWidth: 400,
            lineHeight: 1.5,
            opacity: interpolate(frame, [55, 70], [0, 1], CLAMP),
          }}
        >
          You prepared for weeks. Applied everywhere. Radio silence.
        </p>
      </div>
    </AbsoluteFill>
  );
};
