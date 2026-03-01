import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG, MOCK_SCORECARD } from "../constants";
import { StatCounter } from "./StatCounter";

function barColor(score: number): string {
  if (score < 40) return COLORS.appDanger;
  if (score >= 90) return COLORS.appSuccess;
  return COLORS.appAccent;
}

export const MockScorecard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = MOCK_SCORECARD;

  // Accept button glow
  const acceptDelay = 130;
  const acceptEntrance = spring({
    frame: frame - acceptDelay,
    fps,
    config: SPRING_CONFIG,
  });

  return (
    <div style={{ padding: "32px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Admin review
          </p>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: COLORS.appInk, marginTop: 6 }}>
            Alex Chen
          </h2>
        </div>
        <div
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            background: `${COLORS.appAccent}12`,
            color: COLORS.appAccent,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Under Review
        </div>
      </div>

      {/* Score hero */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 24,
          padding: "20px 24px",
          background: COLORS.appPanel,
          borderRadius: 14,
          border: `1px solid ${COLORS.appBorder}`,
        }}
      >
        <StatCounter
          target={sc.overallScore}
          delayFrames={15}
          durationFrames={30}
          fontSize={56}
          color={barColor(sc.overallScore)}
        />
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.appInk }}>
            {sc.recommendation}
          </p>
          <p style={{ fontSize: 13, color: COLORS.appMuted, marginTop: 4 }}>
            Estimated level: {sc.seniorityEstimate}
          </p>
        </div>
      </div>

      {/* Threshold bar */}
      <div style={{ marginTop: 20, position: "relative", height: 28, borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <div style={{ width: "40%", background: `${COLORS.appDanger}18` }} />
        <div style={{ width: "50%", background: `${COLORS.appAccent}12` }} />
        <div style={{ width: "10%", background: `${COLORS.appSuccess}18` }} />
        {/* Score marker */}
        <div
          style={{
            position: "absolute",
            left: `${sc.overallScore}%`,
            top: 0,
            bottom: 0,
            width: 3,
            background: barColor(sc.overallScore),
            borderRadius: 2,
            boxShadow: `0 0 8px ${barColor(sc.overallScore)}60`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.appMuted }}>
        <span>Reject &lt; 40</span>
        <span>Review</span>
        <span>Advance ≥ 90</span>
      </div>

      {/* Dimension bars */}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        {sc.dimensions.map((dim, i) => {
          const barDelay = 30 + i * 12;
          const barWidth = interpolate(
            frame,
            [barDelay, barDelay + 25],
            [0, dim.score],
            CLAMP,
          );
          return (
            <div key={dim.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.appInk }}>{dim.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: barColor(dim.score) }}>{Math.round(barWidth)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: `${COLORS.appBorder}` }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${barColor(dim.score)}, ${barColor(dim.score)}cc)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Strengths
        </p>
        {sc.strengths.map((s, i) => {
          const sOpacity = interpolate(frame, [90 + i * 10, 100 + i * 10], [0, 1], CLAMP);
          return (
            <p key={s} style={{ fontSize: 13, color: COLORS.appInk, opacity: sOpacity, marginBottom: 4, paddingLeft: 12 }}>
              • {s}
            </p>
          );
        })}
      </div>

      {/* Accept / Reject buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          opacity: acceptEntrance,
          transform: `translateY(${interpolate(acceptEntrance, [0, 1], [8, 0])}px)`,
        }}
      >
        <div
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: `1px solid ${COLORS.appDanger}40`,
            color: COLORS.appDanger,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Reject
        </div>
        <div
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            background: COLORS.appSuccess,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            boxShadow: `0 6px 20px ${COLORS.appSuccess}40`,
          }}
        >
          ✓ Advance to next round
        </div>
      </div>
    </div>
  );
};
