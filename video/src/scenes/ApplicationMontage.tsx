import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Bell, Mail } from "lucide-react";

const APPLICANTS = [
  "Sophia Kim", "Noah Chen", "Emma Zhang", "Liam Patel", "Olivia Silva",
  "James Wu", "Ava Johnson", "Lucas Lee", "Mia Garcia", "Ethan Brown",
  "Isabella Davis", "Mason Taylor", "Charlotte Wang", "Logan Harris", "Amelia Clark",
  "Alexander Nguyen", "Harper Lewis", "Daniel Robinson", "Evelyn Walker", "Henry Young",
  "Abigail Hall", "Sebastian Allen", "Emily King", "Jack Wright", "Ella Scott",
  "Owen Green", "Scarlett Adams", "Samuel Baker", "Victoria Nelson", "Joseph Hill",
  "Grace Mitchell", "David Carter", "Chloe Phillips", "Ryan Evans", "Zoey Turner",
  "William Collins", "Lily Edwards", "Benjamin Stewart", "Hannah Sanchez", "Wyatt Morris",
];

// Each email arrives faster than the last
function getArrival(index: number): number {
  if (index === 0) return 65;
  if (index === 1) return 78;
  if (index === 2) return 89;
  let f = 98;
  for (let i = 3; i <= index; i++) {
    f += Math.max(1, Math.round(9 * Math.pow(0.87, i - 3)));
  }
  return f;
}

const ROW_HEIGHT = 52;

export const ApplicationMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase 1: LinkedIn notification (0–55) ──
  const liEntrance = spring({ frame: frame - 8, fps, config: SPRING_CONFIG });
  const liExit = interpolate(frame, [48, 58], [1, 0], CLAMP);

  // ── Phase 2: Inbox (50–end) ──
  const inboxEntrance = spring({ frame: frame - 50, fps, config: SPRING_CONFIG });

  // Count visible emails
  let visibleCount = 0;
  for (let i = 0; i < APPLICANTS.length; i++) {
    if (frame >= getArrival(i)) visibleCount = i + 1;
  }

  // Counter keeps climbing after named emails
  const lastFrame = getArrival(APPLICANTS.length - 1);
  const extra = frame > lastFrame
    ? Math.round(interpolate(frame, [lastFrame, Math.max(lastFrame + 1, 200)], [0, 500 - APPLICANTS.length], CLAMP))
    : 0;
  const totalCount = Math.min(visibleCount + extra, 500);

  // Scroll offset: push list up as it grows beyond visible area
  const maxVisible = 10;
  const scrollOffset = visibleCount > maxVisible ? (visibleCount - maxVisible) * ROW_HEIGHT : 0;

  const exitOpacity = interpolate(frame, [190, 210], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ background: COLORS.bg, opacity: exitOpacity, overflow: "hidden" }}>
      {/* ── LinkedIn Job Posting ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(liEntrance, [0, 1], [0.88, 1])})`,
          opacity: liEntrance * liExit,
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 560,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              background: "linear-gradient(135deg, #0A66C2, #004182)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>LinkedIn</span>
            <div style={{ flex: 1 }} />
            <Bell size={16} color="#fff" />
          </div>
          <div style={{ padding: "24px 24px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: "linear-gradient(135deg, #FF8C00, #FF6B00)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff",
                }}
              >
                M
              </div>
              <div>
                <p style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>New job posting</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginTop: 2 }}>AI Engineer</p>
                <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 2 }}>Mistral AI · Paris, France · Full-time</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {["LLMs", "PyTorch", "Distributed Systems", "Remote OK"].map((tag, i) => (
                <span
                  key={tag}
                  style={{
                    padding: "4px 12px", borderRadius: 20,
                    background: `${COLORS.indigo}15`, border: `1px solid ${COLORS.indigo}30`,
                    fontSize: 11, fontWeight: 600, color: COLORS.lavender,
                    opacity: interpolate(frame, [18 + i * 5, 25 + i * 5], [0, 1], CLAMP),
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              style={{
                marginTop: 18, display: "inline-flex", padding: "10px 28px",
                borderRadius: 24, background: "#0A66C2", color: "#fff",
                fontSize: 14, fontWeight: 700,
                opacity: interpolate(frame, [30, 38], [0, 1], CLAMP),
              }}
            >
              Easy Apply →
            </div>
          </div>
        </div>
      </div>

      {/* ── HR Inbox — top-to-bottom accumulation ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "row",
          opacity: inboxEntrance,
        }}
      >
        {/* LEFT: Inbox panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "60px 30px 60px 80px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              padding: "14px 20px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
            }}
          >
            <Mail size={18} color={COLORS.indigo} />
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Inbox</span>
            <span style={{ fontSize: 12, color: COLORS.muted }}>— AI Engineer Position</span>
            <div style={{ flex: 1 }} />
            {totalCount > 0 && (
              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 10,
                  background: totalCount > 100
                    ? `linear-gradient(135deg, ${COLORS.red}, #DC2626)`
                    : `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.violet})`,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  boxShadow: totalCount > 100 ? `0 0 12px ${COLORS.red}50` : "none",
                }}
              >
                {totalCount}
              </div>
            )}
          </div>

          {/* Email list — top to bottom, scrolls up */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              borderRadius: 14,
              border: `1px solid ${COLORS.border}`,
              background: "rgba(255,255,255,0.02)",
              position: "relative",
            }}
          >
            <div
              style={{
                transform: `translateY(-${scrollOffset}px)`,
              }}
            >
              {APPLICANTS.map((name, i) => {
                const arrival = getArrival(i);
                if (frame < arrival) return null;

                const age = frame - arrival;
                const rowOpacity = Math.min(1, age / 3);
                const isNew = age < 8;

                return (
                  <div
                    key={i}
                    style={{
                      height: ROW_HEIGHT,
                      padding: "0 20px",
                      borderBottom: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      opacity: rowOpacity,
                      background: isNew ? `${COLORS.indigo}0A` : "transparent",
                    }}
                  >
                    {/* Unread dot */}
                    <div
                      style={{
                        width: 7, height: 7, borderRadius: 4,
                        background: isNew ? COLORS.indigo : "transparent",
                        flexShrink: 0,
                      }}
                    />
                    {/* Avatar */}
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: `linear-gradient(135deg, ${COLORS.indigo}40, ${COLORS.violet}40)`,
                        flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: COLORS.lavender,
                      }}
                    >
                      {name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: isNew ? 700 : 500, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {name}
                      </p>
                      <p style={{ fontSize: 10, color: COLORS.muted, marginTop: 1 }}>
                        New application — AI Engineer
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom fade when overflowing */}
            {visibleCount > maxVisible && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0, height: 50,
                  background: `linear-gradient(to top, ${COLORS.bg}, transparent)`,
                  zIndex: 5,
                }}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Giant counter — emphasis on the NUMBER */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Glow behind counter */}
          <div
            style={{
              position: "absolute",
              width: 500, height: 500,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.indigo}${totalCount > 200 ? "20" : "0C"}, transparent 70%)`,
            }}
          />

          {/* The number */}
          <div
            style={{
              fontSize: totalCount > 100 ? 280 : 220,
              fontWeight: 900,
              color: COLORS.text,
              lineHeight: 0.9,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.03em",
              opacity: interpolate(frame, [65, 75], [0, 1], CLAMP),
              textShadow: totalCount > 200
                ? `0 0 60px ${COLORS.indigo}30`
                : "none",
            }}
          >
            {totalCount}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.muted,
              marginTop: 12,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: interpolate(frame, [70, 82], [0, 1], CLAMP),
            }}
          >
            applicants
          </div>

          {/* "...and counting" appears when counter is high */}
          {totalCount > 100 && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: COLORS.red,
                marginTop: 10,
                opacity: interpolate(totalCount, [100, 200], [0, 1], CLAMP),
              }}
            >
              and counting
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
