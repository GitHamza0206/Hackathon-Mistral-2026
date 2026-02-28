import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";
import { CVCard } from "../components/CVCard";

// ─── 40 candidate names ───────────────────────────────────
const NAMES = [
  "Sarah Kim", "James Li", "Priya Sharma", "Marcus Davis",
  "Elena Volkov", "Amir Hassan", "Rachel Chen", "David Park",
  "Sofia Martinez", "Tom Wilson", "Yuki Tanaka", "Alex Okafor",
  "Mei Zhang", "Omar Abdel", "Luna Perez", "Raj Patel",
  "Anna Müller", "Chris Nwosu", "Hana Sato", "Leo Durand",
  "Fatima Alli", "Ben Choi", "Diana Roth", "Kai Nakamura",
  "Nina Ivanov", "Sam Osei", "Lena Bauer", "Jay Gupta",
  "Ava Morales", "Riku Endo", "Isla Fraser", "Deen Mahdi",
  "Zara Popov", "Emeka Udo", "Clara Voss", "Arun Nair",
  "Mila Kova", "Teo Ruiz", "Ines Leclerc", "Erik Holm",
];
const ROLES = [
  "ML Engineer", "Data Scientist", "SWE", "Senior ML Engineer",
  "AI Researcher", "Backend SWE", "ML Ops", "NLP Engineer",
  "Platform Eng.", "Data Analyst", "CV Engineer", "Applied Scientist",
  "Full Stack SWE", "Data Engineer", "Research Eng.", "ML Infra",
  "Senior SWE", "AI/ML Engineer", "NLP Researcher", "LLM Engineer",
];

// ─── Gaussian mountain layout ─────────────────────────────
// Cards pile up forming a bell curve: dense center, sparse edges
const generateGaussianPile = (count: number) => {
  const cards: { x: number; y: number; rot: number }[] = [];
  const screenW = 1920;
  const centerX = screenW / 2;
  const pileBottom = 680; // bottom of pile (above headline)
  const cardH = 54;
  const cardW = 160;

  // Create columns (bins), gaussian distribution of card counts
  const numBins = 14;
  const binWidth = cardW + 8;
  const sigma = 2.5;

  // Calculate how many cards per bin (gaussian)
  const rawCounts: number[] = [];
  let total = 0;
  for (let b = 0; b < numBins; b++) {
    const z = (b - (numBins - 1) / 2) / sigma;
    const g = Math.exp(-0.5 * z * z);
    rawCounts.push(g);
    total += g;
  }
  // Normalize to fill `count` cards
  const binCounts = rawCounts.map((g) => Math.round((g / total) * count));
  // Adjust to match exactly
  let diff = count - binCounts.reduce((a, b) => a + b, 0);
  for (let i = Math.floor(numBins / 2); diff !== 0; ) {
    binCounts[i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }

  let cardIndex = 0;
  for (let b = 0; b < numBins; b++) {
    const binX = centerX + (b - (numBins - 1) / 2) * binWidth;
    for (let row = 0; row < binCounts[b]; row++) {
      const x = binX - centerX + ((row % 2) * 12 - 6);
      const y = pileBottom - row * (cardH + 4);
      const rot = ((cardIndex * 7 + 3) % 13) - 6;
      cards.push({ x, y, rot });
      cardIndex++;
    }
  }
  return cards;
};

const PILE = generateGaussianPile(NAMES.length);

export const ProblemCompany: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline appears once mountain is mostly formed
  const headlineOpacity = interpolate(frame, [140, 170], [0, 1], CLAMP);
  const subtextOpacity = interpolate(frame, [170, 200], [0, 1], CLAMP);

  // Exit
  const exitOpacity = interpolate(frame, [250, 275], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        opacity: exitOpacity,
      }}
    >
      {/* Falling CV cards — fast stagger, gaussian pile */}
      {NAMES.map((name, i) => {
        const stagger = i * 2.5; // fast stagger
        const fallProgress = spring({
          frame: frame - stagger,
          fps,
          config: { damping: 18, stiffness: 120 }, // snappier fall
        });

        const restY = PILE[i].y;
        const y = interpolate(fallProgress, [0, 1], [-500, restY], CLAMP);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${PILE[i].x}px - 80px)`,
              top: y,
              opacity: fallProgress,
              zIndex: i,
            }}
          >
            <CVCard
              name={name}
              role={ROLES[i % ROLES.length]}
              rotation={PILE[i].rot}
            />
          </div>
        );
      })}

      {/* Headline — below the mountain */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headlineOpacity,
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700, color: COLORS.text }}>
          Buried in applications.
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: COLORS.muted,
            marginTop: 12,
            opacity: subtextOpacity,
          }}
        >
          Screening them properly takes weeks you don't have.
        </div>
      </div>
    </AbsoluteFill>
  );
};
