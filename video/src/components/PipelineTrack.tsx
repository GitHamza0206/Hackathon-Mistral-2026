import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Activity, BarChart3, UserCheck, Bot } from "lucide-react";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";

// Two AI rounds + one human round
const AI_NODES = [
  { label: "Technical Assessment", sublabel: "Algorithms · System Design" },
  { label: "Domain Deep-Dive", sublabel: "Role-specific evaluation" },
];

export const PipelineTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 380 frames
  // Layout: Left block = AI interviews, Right block = Human final
  // This fills the screen much better than a horizontal track

  // Title entrance
  const titleEntrance = spring({ frame: frame - 5, fps, config: SPRING_CONFIG });

  // AI section entrance
  const aiSectionEntrance = spring({ frame: frame - 30, fps, config: SPRING_CONFIG });

  // Individual AI nodes (staggered)
  const node1 = spring({ frame: frame - 50, fps, config: SPRING_CONFIG });
  const node2 = spring({ frame: frame - 80, fps, config: SPRING_CONFIG });

  // "Many interviews" label
  const manyLabel = interpolate(frame, [100, 125], [0, 1], CLAMP);

  // Connector arrow
  const arrowProgress = interpolate(frame, [140, 170], [0, 1], CLAMP);

  // Human section
  const humanEntrance = spring({ frame: frame - 180, fps, config: SPRING_CONFIG });

  // Sub-details on AI nodes
  const detail1 = spring({ frame: frame - 110, fps, config: SPRING_CONFIG });
  const detail2 = spring({ frame: frame - 130, fps, config: SPRING_CONFIG });

  // Bottom tagline
  const taglineOpacity = interpolate(frame, [280, 310], [0, 1], CLAMP);

  // "Automated by Cerno" label
  const autoLabel = interpolate(frame, [60, 85], [0, 1], CLAMP);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleEntrance,
          transform: `translateY(${(1 - titleEntrance) * 20}px)`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.text }}>
          The hiring pipeline, reimagined.
        </div>
      </div>

      {/* ── LEFT BLOCK: AI Interviews ── */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 200,
          width: 800,
          opacity: aiSectionEntrance,
          transform: `translateX(${(1 - aiSectionEntrance) * -40}px)`,
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            opacity: autoLabel,
          }}
        >
          <Bot size={32} color={COLORS.indigo} />
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.indigo }}>
              Automated by Cerno
            </div>
            <div style={{ fontSize: 20, fontWeight: 400, color: COLORS.muted, marginTop: 4 }}>
              As many rounds as you need
            </div>
          </div>
        </div>

        {/* AI Node cards */}
        {AI_NODES.map((node, i) => {
          const entrance = i === 0 ? node1 : node2;
          const detailEntrance = i === 0 ? detail1 : detail2;

          return (
            <div
              key={i}
              style={{
                opacity: entrance,
                transform: `translateY(${(1 - entrance) * 30}px)`,
                background: `${COLORS.indigo}10`,
                border: `1.5px solid ${COLORS.indigo}35`,
                borderRadius: 20,
                padding: "28px 36px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* Node number */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${COLORS.indigo}20`,
                  border: `2px solid ${COLORS.indigo}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.indigo,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                  {node.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 400, color: COLORS.muted, marginTop: 4 }}>
                  {node.sublabel}
                </div>
              </div>

              {/* Detail badges */}
              <div
                style={{
                  opacity: detailEntrance,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: COLORS.muted,
                  }}
                >
                  <Activity size={16} color={COLORS.indigo} />
                  Voice interview
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: COLORS.muted,
                  }}
                >
                  <BarChart3 size={16} color={COLORS.indigo} />
                  Scored transcript
                </div>
              </div>
            </div>
          );
        })}

        {/* "Many interviews" pill */}
        <div
          style={{
            opacity: manyLabel,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 15,
              color: COLORS.indigo,
              fontWeight: 500,
              background: `${COLORS.indigo}12`,
              padding: "6px 20px",
              borderRadius: 100,
              border: `1px solid ${COLORS.indigo}25`,
            }}
          >
            + additional rounds as needed
          </span>
        </div>
      </div>

      {/* ── CONNECTOR ARROW ── */}
      <svg
        width={100}
        height={200}
        style={{
          position: "absolute",
          left: 880,
          top: 400,
        }}
      >
        <line
          x1={0}
          y1={100}
          x2={100}
          y2={100}
          stroke={COLORS.muted}
          strokeWidth={2}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - arrowProgress)}
          opacity={0.5}
        />
        <polygon
          points="85,90 100,100 85,110"
          fill={COLORS.muted}
          opacity={arrowProgress * 0.5}
        />
      </svg>

      {/* ── RIGHT BLOCK: Human Final ── */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 280,
          width: 500,
          opacity: humanEntrance,
          transform: `translateX(${(1 - humanEntrance) * 40}px)`,
        }}
      >
        <div
          style={{
            background: `${COLORS.lavender}08`,
            border: `1.5px solid ${COLORS.lavender}30`,
            borderRadius: 24,
            padding: "40px 44px",
            textAlign: "center",
          }}
        >
          {/* Human icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `${COLORS.lavender}18`,
              border: `2px solid ${COLORS.lavender}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <UserCheck size={36} color={COLORS.lavender} />
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.lavender,
              marginBottom: 8,
            }}
          >
            Final Interview
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: COLORS.text,
              marginBottom: 4,
            }}
          >
            Your senior engineer.
          </div>
          <div style={{ fontSize: 18, fontWeight: 400, color: COLORS.muted }}>
            Only when it matters.
          </div>

          {/* Human badge */}
          <div
            style={{
              marginTop: 20,
              display: "inline-block",
              background: COLORS.lavender,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 20px",
              borderRadius: 100,
            }}
          >
            Human
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: COLORS.muted,
            fontStyle: "italic",
          }}
        >
          Your pipeline moves forward while your team sleeps.
        </div>
      </div>
    </div>
  );
};
