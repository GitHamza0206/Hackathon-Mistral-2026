import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, random } from "remotion";
import { COLORS, CLAMP, SPRING_SNAPPY } from "../constants";

// Star candidates — would have been PERFECT but get rejected anyway
const STAR_CANDIDATES = [
  { name: "Sophia Kim", tagline: "PhD Stanford · 8 yrs · Ex-DeepMind", x: 300, y: 280 },
  { name: "Noah Chen", tagline: "12 yrs exp · Built GPT infra at OpenAI", x: 1100, y: 350 },
  { name: "Isabella Davis", tagline: "Top 1% Kaggle · 3 ICML papers", x: 650, y: 520 },
  { name: "James Wu", tagline: "Principal Eng · Ex-Google Brain · 15 yrs", x: 1350, y: 200 },
  { name: "Amelia Clark", tagline: "Led ML team of 20 · Series A to IPO", x: 400, y: 700 },
];

// Regular rejected cards
const REJECT_CARDS = Array.from({ length: 20 }, (_, i) => ({
  name: [
    "Emma Zhang", "Liam Patel", "Olivia Silva", "Lucas Lee", "Mia Garcia",
    "Ethan Brown", "Mason Taylor", "Charlotte Wang", "Logan Harris", "Harper Lewis",
    "Daniel Robinson", "Evelyn Walker", "Henry Young", "Abigail Hall", "Sebastian Allen",
    "Emily King", "Jack Wright", "Ella Scott", "Owen Green", "Morgan Wu",
  ][i],
  x: 150 + random(`rx-${i}`) * 1600,
  y: 150 + random(`ry-${i}`) * 700,
  rotation: (random(`rr-${i}`) - 0.5) * 20,
  exitAngle: (random(`ra-${i}`) - 0.5) * 60,
  exitDelay: 42 + i * 2.5,
}));

export const HRRejection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Cards visible (0–35)
  // Phase 2: "90%" slams in (28–50)
  // Phase 3: Regular cards fly off (40–90)
  // Phase 4: Star cards GLOW — you see who you're losing (50–90)
  // Phase 5: REJECTED stamp slams on star cards too (80–95)
  // Phase 6: Star cards get swept away (90–110)
  // Phase 7: Gut-punch text (105–150)

  const percentEntrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  const stampEntrance = spring({
    frame: frame - 80,
    fps,
    config: { damping: 10, stiffness: 250 },
  });

  const exitOpacity = interpolate(frame, [160, 180], [1, 0], CLAMP);

  // Screen shake on stamp
  const shakeX = frame >= 80 && frame < 90
    ? Math.sin(frame * 8) * interpolate(frame, [80, 90], [8, 0], CLAMP)
    : 0;
  const shakeY = frame >= 80 && frame < 90
    ? Math.cos(frame * 10) * interpolate(frame, [80, 90], [5, 0], CLAMP)
    : 0;

  // Gut-punch line
  const punchEntrance = spring({
    frame: frame - 108,
    fps,
    config: SPRING_SNAPPY,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity: exitOpacity,
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Red danger flash on stamp */}
      <AbsoluteFill
        style={{
          background: COLORS.red,
          opacity: frame >= 80 && frame < 86
            ? interpolate(frame, [80, 82, 86], [0.25, 0.12, 0], CLAMP)
            : 0,
          pointerEvents: "none",
        }}
      />

      {/* Regular cards that get rejected */}
      {REJECT_CARDS.map((card, i) => {
        const cardOpacity = interpolate(frame, [0, 8], [0, 0.6], CLAMP);
        const exitProgress = interpolate(
          frame,
          [card.exitDelay, card.exitDelay + 18],
          [0, 1],
          CLAMP,
        );
        const exitEased = 1 - Math.pow(1 - exitProgress, 2);
        const flyX = exitEased * (card.exitAngle > 0 ? 2200 : -2200);
        const flyY = exitEased * -500;
        const flyRotation = card.rotation + exitEased * card.exitAngle * 3;

        return (
          <div
            key={`reg-${i}`}
            style={{
              position: "absolute",
              left: card.x + flyX,
              top: card.y + flyY,
              width: 155,
              height: 42,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${exitProgress > 0 ? COLORS.red + "50" : "rgba(255,255,255,0.06)"}`,
              opacity: cardOpacity * (1 - exitProgress),
              transform: `rotate(${flyRotation}deg)`,
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              gap: 8,
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 10, background: `${COLORS.indigo}30`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
              {card.name}
            </span>
          </div>
        );
      })}

      {/* STAR candidates — glow gold, show credentials, THEN get rejected */}
      {STAR_CANDIDATES.map((star, i) => {
        const cardOpacity = interpolate(frame, [0, 10], [0, 1], CLAMP);

        // Stars glow after regular cards start leaving
        const glowStart = 50 + i * 5;
        const glowProgress = interpolate(frame, [glowStart, glowStart + 15], [0, 1], CLAMP);

        // Tagline reveals
        const taglineOpacity = interpolate(frame, [glowStart + 5, glowStart + 15], [0, 1], CLAMP);

        // Stars get swept away LATER (after stamp)
        const starExitDelay = 92 + i * 4;
        const starExitProgress = interpolate(frame, [starExitDelay, starExitDelay + 15], [0, 1], CLAMP);
        const starExitEased = 1 - Math.pow(1 - starExitProgress, 3);

        const flyX = starExitEased * (i % 2 === 0 ? -2500 : 2500);
        const flyY = starExitEased * -300;
        const flyRot = starExitEased * (i % 2 === 0 ? -40 : 40);

        // Pulsing glow on star cards
        const pulse = 0.6 + Math.sin(frame * 0.15 + i) * 0.4;

        return (
          <div
            key={`star-${i}`}
            style={{
              position: "absolute",
              left: star.x + flyX,
              top: star.y + flyY,
              opacity: cardOpacity * (1 - starExitProgress),
              transform: `rotate(${flyRot}deg)`,
              zIndex: 5,
            }}
          >
            {/* Card */}
            <div
              style={{
                width: 220,
                padding: "12px 14px",
                borderRadius: 12,
                background: glowProgress > 0
                  ? `linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.08))`
                  : "rgba(255,255,255,0.05)",
                border: `2px solid ${glowProgress > 0 ? COLORS.appSuccess + "80" : "rgba(255,255,255,0.08)"}`,
                boxShadow: glowProgress > 0
                  ? `0 0 ${20 + pulse * 15}px ${COLORS.appSuccess}30, 0 0 ${40 + pulse * 20}px ${COLORS.appSuccess}15`
                  : "none",
                transition: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: glowProgress > 0
                      ? `linear-gradient(135deg, ${COLORS.appSuccess}60, ${COLORS.indigo}60)`
                      : `${COLORS.indigo}30`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {glowProgress > 0 && (
                    <span style={{ fontSize: 14 }}>★</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: glowProgress > 0 ? COLORS.text : "rgba(255,255,255,0.6)",
                  }}
                >
                  {star.name}
                </span>
              </div>

              {/* Credential tagline — reveals on glow */}
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  color: COLORS.appSuccess,
                  opacity: taglineOpacity,
                  letterSpacing: "0.02em",
                  lineHeight: 1.3,
                }}
              >
                {star.tagline}
              </div>
            </div>

            {/* "IDEAL CANDIDATE" badge */}
            {glowProgress > 0.5 && (
              <div
                style={{
                  marginTop: 6,
                  display: "inline-flex",
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: `${COLORS.appSuccess}20`,
                  border: `1px solid ${COLORS.appSuccess}40`,
                  fontSize: 9,
                  fontWeight: 800,
                  color: COLORS.appSuccess,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  opacity: interpolate(glowProgress, [0.5, 1], [0, 1]),
                }}
              >
                ★ Perfect match
              </div>
            )}
          </div>
        );
      })}

      {/* Giant 90% */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(percentEntrance, [0, 1], [3, 1])})`,
          opacity: percentEntrance,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 240,
            fontWeight: 900,
            color: COLORS.red,
            lineHeight: 0.9,
            textShadow: `0 0 80px ${COLORS.red}50`,
          }}
        >
          90%
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.text,
            marginTop: 8,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          thrown away
        </div>
      </div>

      {/* REJECTED stamp */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(-12deg) scale(${interpolate(stampEntrance, [0, 1], [4, 1])})`,
          opacity: stampEntrance,
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: COLORS.red,
            border: `6px solid ${COLORS.red}`,
            borderRadius: 12,
            padding: "10px 36px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: `${COLORS.bg}E0`,
          }}
        >
          REJECTED
        </div>
      </div>

      {/* Gut-punch closing line */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 30,
          opacity: punchEntrance,
          transform: `translateY(${interpolate(punchEntrance, [0, 1], [25, 0])}px)`,
        }}
      >
        <p
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.text,
            lineHeight: 1.4,
          }}
        >
          Your next{" "}
          <span
            style={{
              color: COLORS.appSuccess,
              textShadow: `0 0 30px ${COLORS.appSuccess}40`,
            }}
          >
            ideal hire
          </span>{" "}
          was in that pile.
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.muted,
            marginTop: 8,
            opacity: interpolate(frame, [118, 130], [0, 1], CLAMP),
          }}
        >
          They never even got an interview.
        </p>
      </div>
    </AbsoluteFill>
  );
};
