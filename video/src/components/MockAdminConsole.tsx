import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";

const KANBAN_COLUMNS = [
  {
    title: "Applied",
    color: COLORS.appMuted,
    candidates: ["Jordan Lee", "Sam Patel", "Morgan Wu"],
  },
  {
    title: "In Progress",
    color: COLORS.appAccent,
    candidates: ["Alex Chen"],
  },
  {
    title: "Under Review",
    color: COLORS.amber,
    candidates: ["Priya Sharma", "Marcus Davis"],
  },
  {
    title: "Accepted",
    color: COLORS.appSuccess,
    candidates: ["Taylor Kim"],
  },
  {
    title: "Rejected",
    color: COLORS.appDanger,
    candidates: ["Casey Brown"],
  },
];

export const MockAdminConsole: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ padding: "32px 48px" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 6,
          borderRadius: 14,
          background: COLORS.appPanel,
          border: `1px solid ${COLORS.appBorder}`,
          marginBottom: 28,
        }}
      >
        {["Interviews", "Candidates"].map((tab, i) => {
          const isActive = i === 1;
          return (
            <div
              key={tab}
              style={{
                position: "relative",
                padding: "10px 28px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : COLORS.appMuted,
                background: isActive
                  ? `linear-gradient(135deg, ${COLORS.appAccent}, ${COLORS.violet})`
                  : "transparent",
                boxShadow: isActive ? `0 6px 20px ${COLORS.appAccent}40` : "none",
              }}
            >
              {tab}
              {/* Notification badge on Candidates */}
              {tab === "Candidates" && (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.appAccent}, ${COLORS.violet})`,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${COLORS.appBg}`,
                  }}
                >
                  3
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div style={{ display: "flex", gap: 16 }}>
        {KANBAN_COLUMNS.map((col, ci) => {
          const colDelay = 15 + ci * 12;
          const colOpacity = interpolate(frame, [colDelay, colDelay + 15], [0, 1], CLAMP);

          return (
            <div
              key={col.title}
              style={{
                flex: 1,
                opacity: colOpacity,
                background: COLORS.appPanel,
                borderRadius: 14,
                border: `1px solid ${COLORS.appBorder}`,
                padding: 16,
                minHeight: 400,
              }}
            >
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: col.color,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.appInk, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {col.title}
                </span>
                <span style={{ fontSize: 12, color: COLORS.appMuted, fontWeight: 600 }}>
                  {col.candidates.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.candidates.map((name, ni) => {
                  const cardDelay = colDelay + 15 + ni * 10;
                  const cardEntrance = spring({
                    frame: frame - cardDelay,
                    fps,
                    config: SPRING_CONFIG,
                  });

                  return (
                    <div
                      key={name}
                      style={{
                        opacity: cardEntrance,
                        transform: `translateY(${interpolate(cardEntrance, [0, 1], [15, 0])}px)`,
                        padding: "14px 16px",
                        borderRadius: 10,
                        background: "#fff",
                        border: `1px solid ${COLORS.appBorder}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.appInk }}>
                        {name}
                      </p>
                      <p style={{ fontSize: 11, color: COLORS.appMuted, marginTop: 4 }}>
                        Senior ML Engineer
                      </p>
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
