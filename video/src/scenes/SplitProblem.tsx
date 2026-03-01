import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Building2, User, Clock, FileStack, Hourglass } from "lucide-react";

const COMPANY_PAINS = [
  "200 applications received",
  "3 reviewers available",
  "2 weeks to shortlist",
  "No consistency in scoring",
];

const CANDIDATE_PAINS = [
  "Applied 47 days ago",
  "No status update",
  "Prepared for weeks",
  "Still waiting...",
];

export const SplitProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Divider draws down
  const dividerHeight = interpolate(frame, [10, 40], [0, 100], CLAMP);

  // Left panel
  const leftEntrance = spring({ frame: frame - 20, fps, config: SPRING_CONFIG });
  // Right panel
  const rightEntrance = spring({ frame: frame - 35, fps, config: SPRING_CONFIG });

  const exitOpacity = interpolate(frame, [210, 235], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        opacity: exitOpacity,
      }}
    >
      {/* Left: Company side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          opacity: leftEntrance,
          transform: `translateX(${interpolate(leftEntrance, [0, 1], [-40, 0])}px)`,
          padding: "60px 50px",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Building2 size={36} color="#fff" />
        </div>

        <p
          style={{
            fontSize: 22,
            color: COLORS.muted,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          The company
        </p>

        {/* Pain points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          {COMPANY_PAINS.map((pain, i) => {
            const delay = 50 + i * 18;
            const entrance = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });
            return (
              <div
                key={pain}
                style={{
                  opacity: entrance,
                  transform: `translateX(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: COLORS.appDanger,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 17, fontWeight: 500, color: COLORS.text }}>
                  {pain}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center divider */}
      <div
        style={{
          width: 2,
          background: `linear-gradient(to bottom, transparent, ${COLORS.indigo}, transparent)`,
          height: `${dividerHeight}%`,
          alignSelf: "center",
        }}
      />

      {/* Right: Candidate side */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          opacity: rightEntrance,
          transform: `translateX(${interpolate(rightEntrance, [0, 1], [40, 0])}px)`,
          padding: "60px 50px",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${COLORS.lavender}, ${COLORS.violet})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={36} color="#fff" />
        </div>

        <p
          style={{
            fontSize: 22,
            color: COLORS.muted,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          The candidate
        </p>

        {/* Pain points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 380 }}>
          {CANDIDATE_PAINS.map((pain, i) => {
            const delay = 65 + i * 18;
            const entrance = spring({ frame: frame - delay, fps, config: SPRING_CONFIG });
            return (
              <div
                key={pain}
                style={{
                  opacity: entrance,
                  transform: `translateX(${interpolate(entrance, [0, 1], [20, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: COLORS.amber,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 17, fontWeight: 500, color: COLORS.text }}>
                  {pain}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [160, 185], [0, 1], CLAMP),
          transform: `translateY(${interpolate(frame, [160, 185], [10, 0], CLAMP)}px)`,
        }}
      >
        <p style={{ fontSize: 30, fontWeight: 600, color: COLORS.text }}>
          Broken for <span style={{ color: COLORS.appDanger }}>everyone</span>.
        </p>
      </div>
    </AbsoluteFill>
  );
};
