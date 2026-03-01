import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { COLORS, CLAMP } from "../constants";

// Candidate names for falling cards
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
];

// Generate card positions with gaussian-like distribution
function gaussianX(seed: string, centerX: number, spread: number): number {
  // Box-Muller-ish using Remotion's deterministic random
  const u1 = random(seed + "-u1");
  const u2 = random(seed + "-u2");
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 0.001))) * Math.cos(2 * Math.PI * u2);
  return centerX + z * spread;
}

interface FallingCard {
  name: string;
  x: number;
  startFrame: number;
  fallDuration: number;
  finalY: number;
  rotation: number;
  width: number;
}

const CENTER_X = 960;
const SPREAD = 280;
const PILE_BASE_Y = 680;

const CARDS: FallingCard[] = NAMES.map((name, i) => {
  const x = gaussianX(`card-${i}`, CENTER_X, SPREAD);
  const startFrame = 5 + i * 3.5;
  const fallDuration = 25 + random(`dur-${i}`) * 15;
  // Stack higher cards slightly higher
  const distFromCenter = Math.abs(x - CENTER_X);
  const heightBonus = Math.max(0, 1 - distFromCenter / (SPREAD * 2));
  const finalY = PILE_BASE_Y - heightBonus * 180 - random(`y-${i}`) * 60;
  const rotation = (random(`rot-${i}`) - 0.5) * 30;
  const width = 140 + random(`w-${i}`) * 30;

  return { name, x, startFrame, fallDuration, finalY, rotation, width };
});

export const StatHook: React.FC = () => {
  const frame = useCurrentFrame();

  // Counter goes from 0 to 300+
  const maxCards = CARDS.filter((c) => frame >= c.startFrame + c.fallDuration).length;
  const counterTarget = Math.min(Math.round((maxCards / NAMES.length) * 347), 347);
  const counterValue = Math.round(
    interpolate(frame, [10, 190], [0, counterTarget], CLAMP),
  );

  const counterOpacity = interpolate(frame, [5, 20], [0, 0.25], CLAMP);
  const subtitleOpacity = interpolate(frame, [140, 165], [0, 1], CLAMP);
  const subtitleY = interpolate(frame, [140, 165], [20, 0], CLAMP);
  const exitOpacity = interpolate(frame, [210, 235], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity: exitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Background counter */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 320,
          fontWeight: 900,
          color: COLORS.indigo,
          opacity: counterOpacity,
          zIndex: 0,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {counterValue}+
      </div>

      {/* Falling cards */}
      {CARDS.map((card, i) => {
        if (frame < card.startFrame) return null;

        const progress = Math.min(
          (frame - card.startFrame) / card.fallDuration,
          1,
        );
        // Ease-out bounce
        const eased = progress < 1
          ? 1 - Math.pow(1 - progress, 3)
          : 1;

        const currentY = interpolate(eased, [0, 1], [-100, card.finalY]);
        const cardOpacity = interpolate(progress, [0, 0.1], [0, 1], CLAMP);
        const cardScale = interpolate(progress, [0.9, 1], [1, 0.98], CLAMP);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: card.x - card.width / 2,
              top: currentY,
              width: card.width,
              height: 40,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.bgCard}, rgba(255,255,255,0.07))`,
              border: `1px solid ${COLORS.border}`,
              opacity: cardOpacity,
              transform: `rotate(${card.rotation}deg) scale(${cardScale})`,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              zIndex: i,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {/* Avatar dot */}
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                background: `linear-gradient(135deg, ${COLORS.indigo}60, ${COLORS.violet}60)`,
                marginRight: 8,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.text,
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

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          zIndex: 100,
        }}
      >
        <p
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: COLORS.text,
            maxWidth: 900,
            margin: "0 auto",
            lineHeight: 1.4,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          Hundreds of applicants.{" "}
          <span style={{ color: COLORS.indigo }}>Most never get a chance.</span>
        </p>
      </div>
    </AbsoluteFill>
  );
};
