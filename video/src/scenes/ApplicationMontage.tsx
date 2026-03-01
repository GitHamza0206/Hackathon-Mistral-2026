import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { COLORS, CLAMP } from "../constants";

const NAMES = [
  "Emma Zhang", "Liam Patel", "Sophia Kim", "Noah Chen", "Olivia Silva",
  "James Wu", "Ava Johnson", "Lucas Lee", "Mia Garcia", "Ethan Brown",
  "Isabella Davis", "Mason Taylor", "Charlotte Wang", "Logan Harris", "Amelia Clark",
  "Alexander Nguyen", "Harper Lewis", "Daniel Robinson", "Evelyn Walker", "Henry Young",
  "Abigail Hall", "Sebastian Allen", "Emily King", "Jack Wright", "Ella Scott",
  "Owen Green", "Scarlett Adams", "Samuel Baker", "Victoria Nelson", "Joseph Hill",
  "Grace Mitchell", "David Carter", "Chloe Phillips", "Ryan Evans", "Zoey Turner",
  "William Collins", "Lily Edwards", "Benjamin Stewart", "Hannah Sanchez", "Wyatt Morris",
  "Aria Rogers", "John Reed", "Riley Cook", "Michael Morgan", "Layla Bell",
  "Caleb Murphy", "Penelope Bailey", "Luke Rivera", "Nora Cooper", "Isaac Richardson",
  "Madison Brooks", "Jayden Foster", "Aubrey Howard", "Aiden Ward", "Luna Torres",
  "Grayson Sanders", "Hazel Price", "Elijah Barnes", "Camila Ross", "Leo Powell",
];

interface FallingCard {
  name: string;
  x: number;
  startFrame: number;
  speed: number;
  rotation: number;
  width: number;
  lane: number;
}

const CARDS: FallingCard[] = NAMES.map((name, i) => {
  const lane = i % 8;
  const laneWidth = 1920 / 8;
  const x = lane * laneWidth + random(`x-${i}`) * (laneWidth - 180) + 20;
  const startFrame = i * 2.5 + random(`start-${i}`) * 5;
  const speed = 6 + random(`speed-${i}`) * 4;
  const rotation = (random(`rot-${i}`) - 0.5) * 16;
  const width = 150 + random(`w-${i}`) * 30;

  return { name, x, startFrame, speed, rotation, width, lane };
});

export const ApplicationMontage: React.FC = () => {
  const frame = useCurrentFrame();

  // Counter
  const counterValue = Math.min(
    Math.round(interpolate(frame, [5, 180], [0, 512], CLAMP)),
    512,
  );

  const exitOpacity = interpolate(frame, [185, 210], [1, 0], CLAMP);

  // "Apply" button flash
  const applyFlash = frame % 12 < 2 && frame > 10 && frame < 170 ? 0.15 : 0;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Apply flash overlay */}
      <AbsoluteFill
        style={{
          background: COLORS.indigo,
          opacity: applyFlash,
          pointerEvents: "none",
        }}
      />

      {/* Falling application cards */}
      {CARDS.map((card, i) => {
        if (frame < card.startFrame) return null;

        const elapsed = frame - card.startFrame;
        const y = -80 + elapsed * card.speed;

        if (y > 1200) return null;

        const cardOpacity = interpolate(elapsed, [0, 3], [0, 0.9], CLAMP);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: card.x,
              top: y,
              width: card.width,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))`,
              border: `1px solid rgba(255,255,255,0.1)`,
              opacity: cardOpacity,
              transform: `rotate(${card.rotation}deg)`,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: 10,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.indigo}50, ${COLORS.violet}50)`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {card.name}
            </span>
          </div>
        );
      })}

      {/* Central counter */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: COLORS.text,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 80px ${COLORS.bg}, 0 0 40px ${COLORS.bg}`,
            opacity: interpolate(frame, [5, 20], [0, 1], CLAMP),
          }}
        >
          {counterValue}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.muted,
            marginTop: 8,
            textShadow: `0 0 30px ${COLORS.bg}`,
            opacity: interpolate(frame, [20, 35], [0, 1], CLAMP),
          }}
        >
          applications received
        </div>
      </div>
    </AbsoluteFill>
  );
};
