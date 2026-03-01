import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG, MOCK_CANDIDATES, MOCK_SCORECARD } from "../constants";

function barColor(score: number): string {
  if (score < 40) return COLORS.appDanger;
  if (score >= 90) return COLORS.appSuccess;
  return COLORS.appAccent;
}

// Per-candidate dimension scores
const CANDIDATE_DIMS = [
  [85, 78, 80, 88, 79],  // Alex Chen
  [92, 88, 85, 94, 90],  // Priya Sharma
  [55, 48, 60, 52, 58],  // Marcus Davis
];

const DIM_LABELS = MOCK_SCORECARD.dimensions.map((d) => d.label);

export const MockComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ padding: "32px 40px" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Candidate comparison
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.appInk, marginTop: 6, marginBottom: 24 }}>
        Side-by-side scorecard review
      </h2>

      <div style={{ display: "flex", gap: 16 }}>
        {MOCK_CANDIDATES.map((candidate, ci) => {
          const colDelay = 10 + ci * 15;
          const colEntrance = spring({
            frame: frame - colDelay,
            fps,
            config: SPRING_CONFIG,
          });

          const scores = CANDIDATE_DIMS[ci];
          const isBest = candidate.score === Math.max(...MOCK_CANDIDATES.map((c) => c.score));

          return (
            <div
              key={candidate.name}
              style={{
                flex: 1,
                opacity: colEntrance,
                transform: `translateY(${interpolate(colEntrance, [0, 1], [20, 0])}px)`,
                padding: 20,
                borderRadius: 14,
                background: "#fff",
                border: `1px solid ${isBest ? COLORS.appSuccess + "40" : COLORS.appBorder}`,
                boxShadow: isBest ? `0 4px 20px ${COLORS.appSuccess}15` : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Name + score */}
              <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.appInk }}>
                {candidate.name}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: barColor(candidate.score),
                  }}
                >
                  {Math.round(interpolate(frame, [colDelay + 5, colDelay + 30], [0, candidate.score], CLAMP))}
                </span>
                <span style={{ fontSize: 12, color: COLORS.appMuted }}>
                  {candidate.recommendation}
                </span>
              </div>
              <p style={{ fontSize: 11, color: COLORS.appMuted, marginTop: 4 }}>
                Est. level: {candidate.seniority}
              </p>

              {/* Dimension bars */}
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {DIM_LABELS.map((label, di) => {
                  const score = scores[di];
                  const barDelay = colDelay + 20 + di * 8;
                  const barWidth = interpolate(
                    frame,
                    [barDelay, barDelay + 20],
                    [0, score],
                    CLAMP,
                  );
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: COLORS.appMuted }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: barColor(score) }}>
                          {Math.round(barWidth)}
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: COLORS.appBorder }}>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            width: `${barWidth}%`,
                            background: barColor(score),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
