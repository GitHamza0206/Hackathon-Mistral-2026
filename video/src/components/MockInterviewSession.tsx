import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, CLAMP, MOCK_TRANSCRIPT } from "../constants";
import { TypewriterText } from "./TypewriterText";

export const MockInterviewSession: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress bar fills over the scene
  const progressWidth = interpolate(frame, [0, 280], [15, 62], CLAMP);
  const progressColor = progressWidth > 50 ? COLORS.amber : COLORS.appAccent;

  // Timer countdown
  const timerMinutes = Math.max(0, 22 - Math.floor(frame / 30 * 0.6));
  const timerSeconds = Math.max(0, 59 - (frame % 50));
  const timerText = `${timerMinutes}:${String(timerSeconds % 60).padStart(2, "0")}`;

  // Mic level simulation
  const micLevel = 30 + Math.sin(frame * 0.3) * 20 + Math.sin(frame * 0.7) * 15;
  const micHeight = Math.max(10, Math.min(90, micLevel));

  // Connection quality dot
  const dotPulse = 0.8 + Math.sin(frame * 0.15) * 0.2;

  // Transcript line timing
  const LINE_DELAYS = [20, 70, 130, 190];

  return (
    <div style={{ padding: "28px 40px", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Top bar: role + timer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Live interview
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.appInk }}>
            Senior ML Engineer
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Connection quality dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: COLORS.appSuccess,
                opacity: dotPulse,
                boxShadow: `0 0 6px ${COLORS.appSuccess}60`,
              }}
            />
            <span style={{ fontSize: 11, color: COLORS.appMuted }}>Good</span>
          </div>
          {/* Timer */}
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: COLORS.appPanel,
              border: `1px solid ${COLORS.appBorder}`,
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.appInk,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timerText}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: `${COLORS.appBorder}`, marginBottom: 24 }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            width: `${progressWidth}%`,
            background: `linear-gradient(90deg, ${COLORS.appAccent}, ${progressColor})`,
            transition: "none",
          }}
        />
      </div>

      {/* Main content: speaking + transcript */}
      <div style={{ display: "flex", gap: 32 }}>
        {/* Left: speaking indicator + mic meter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: 120 }}>
          {/* Speaking animation */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.appAccent}15, ${COLORS.violet}10)`,
              border: `2px solid ${COLORS.appAccent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {/* Animated bars */}
            {[0, 1, 2, 3, 4].map((i) => {
              const barHeight = 12 + Math.sin(frame * 0.2 + i * 1.2) * 10 + Math.sin(frame * 0.35 + i * 0.8) * 6;
              return (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: Math.max(4, barHeight),
                    borderRadius: 3,
                    background: `linear-gradient(to top, ${COLORS.appAccent}, ${COLORS.violet})`,
                  }}
                />
              );
            })}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.appAccent }}>
            Speaking
          </span>

          {/* Mic level meter */}
          <div
            style={{
              width: 6,
              height: 80,
              borderRadius: 3,
              background: `${COLORS.appBorder}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: 6,
                height: `${micHeight}%`,
                borderRadius: 3,
                background: `linear-gradient(to top, ${COLORS.appAccent}, ${COLORS.violet})`,
              }}
            />
          </div>
        </div>

        {/* Right: transcript */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {MOCK_TRANSCRIPT.map((entry, i) => {
            const delay = LINE_DELAYS[i];
            const entryOpacity = interpolate(frame, [delay, delay + 8], [0, 1], CLAMP);
            const isAgent = entry.speaker === "agent";

            return (
              <div
                key={i}
                style={{
                  opacity: entryOpacity,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: isAgent ? `${COLORS.appAccent}06` : "#fff",
                  border: `1px solid ${isAgent ? COLORS.appAccent + "18" : COLORS.appBorder}`,
                  borderLeft: `3px solid ${isAgent ? COLORS.appAccent : COLORS.violet}`,
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: isAgent ? COLORS.appAccent : COLORS.violet, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isAgent ? "Interviewer" : "Candidate"}
                </p>
                <TypewriterText
                  text={entry.text}
                  delayFrames={delay + 5}
                  charsPerFrame={0.9}
                  fontSize={14}
                  color={COLORS.appInk}
                  cursor={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
