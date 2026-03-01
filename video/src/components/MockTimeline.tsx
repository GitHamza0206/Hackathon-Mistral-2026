import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";

const SESSIONS = [
  { name: "Alex Chen", start: 10, end: 55, active: false, score: 82 },
  { name: "Priya Sharma", start: 20, end: 65, active: false, score: 91 },
  { name: "Jordan Lee", start: 35, end: 70, active: true, score: null },
  { name: "Sam Patel", start: 50, end: 85, active: false, score: 67 },
  { name: "Taylor Kim", start: 60, end: 95, active: false, score: 54 },
  { name: "Morgan Wu", start: 15, end: 45, active: false, score: 78 },
  { name: "Casey Brown", start: 40, end: 80, active: false, score: 43 },
];

export const MockTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
        Session timeline
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {SESSIONS.map((session, i) => {
          const rowDelay = 10 + i * 8;
          const rowEntrance = spring({
            frame: frame - rowDelay,
            fps,
            config: SPRING_CONFIG,
          });

          const trackWidth = 420;
          const nameWidth = 120;
          const barLeft = (session.start / 100) * trackWidth;
          const barWidth = ((session.end - session.start) / 100) * trackWidth;
          const barWidthAnimated = barWidth * rowEntrance;

          // Active session pulse
          const pulse = session.active
            ? 0.6 + Math.sin(frame * 0.12) * 0.4
            : 1;

          return (
            <div
              key={session.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: rowEntrance,
              }}
            >
              <span
                style={{
                  width: nameWidth,
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.appInk,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session.name}
              </span>

              {/* Track */}
              <div
                style={{
                  flex: 1,
                  height: 22,
                  borderRadius: 6,
                  background: `${COLORS.appBorder}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: barLeft,
                    top: 3,
                    width: barWidthAnimated,
                    height: 16,
                    borderRadius: 4,
                    background: session.active
                      ? `linear-gradient(90deg, ${COLORS.appAccent}, ${COLORS.violet})`
                      : `linear-gradient(90deg, ${COLORS.appAccent}80, ${COLORS.violet}60)`,
                    opacity: pulse,
                    boxShadow: session.active
                      ? `0 0 12px ${COLORS.appAccent}40`
                      : "none",
                  }}
                />
              </div>

              {/* Score badge */}
              <span
                style={{
                  width: 40,
                  fontSize: 13,
                  fontWeight: 700,
                  color: session.active
                    ? COLORS.appAccent
                    : session.score && session.score >= 70
                      ? COLORS.appSuccess
                      : session.score && session.score < 50
                        ? COLORS.appDanger
                        : COLORS.appInk,
                  textAlign: "right",
                }}
              >
                {session.active ? "Live" : session.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div style={{ display: "flex", marginLeft: 132, marginTop: 12, paddingRight: 52 }}>
        {["9:00", "10:00", "11:00", "12:00", "13:00"].map((label, i) => (
          <span
            key={label}
            style={{
              flex: 1,
              fontSize: 12,
              color: COLORS.appMuted,
              textAlign: i === 0 ? "left" : "center",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
