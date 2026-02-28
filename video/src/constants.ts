// ─── Colors (from Cerno logo palette) ─────────────────────
export const COLORS = {
  bg: "#0F0F14",
  bgCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  indigo: "#6366F1",    // primary
  violet: "#8B5CF6",    // secondary
  lavender: "#A78BFA",  // accent
  green: "#34D399",
  amber: "#FBBF24",
  text: "#EFEFEF",
  muted: "#64748B",
} as const;

// ─── Spring config ────────────────────────────────────────
export const SPRING_CONFIG = { damping: 14, stiffness: 80 } as const;
export const SPRING_SMOOTH = { damping: 200 } as const;

// ─── Interpolate defaults ─────────────────────────────────
export const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Scene boundaries (in frames, 30 fps) ─────────────────
export const FPS = 30;
export const TOTAL_FRAMES = 2700; // 90 seconds

// Act 1: The system is broken (0–16.3s)
export const SCENE_1_START = 0;
export const SCENE_1_END = 280;   // 0–9.3s   Company problem

export const SCENE_2_START = 280;
export const SCENE_2_END = 490;   // 9.3–16.3s  Candidate problem

// Act 2: Cerno replaces the pipeline (16.3–49s)
export const SCENE_3_START = 490;
export const SCENE_3_END = 760;   // 16.3–25.3s  Cerno reveal

export const SCENE_4_START = 760;
export const SCENE_4_END = 1140;  // 25.3–38s  Pipeline (centerpiece)

export const SCENE_5_START = 1140;
export const SCENE_5_END = 1470;  // 38–49s  How it works

// Act 3: Signal, not noise (49–90s)
export const SCENE_6_START = 1470;
export const SCENE_6_END = 1850;  // 49–61.7s  Specialization

export const SCENE_7_START = 1850;
export const SCENE_7_END = 2270;  // 61.7–75.7s  Outcomes

export const SCENE_8_START = 2270;
export const SCENE_8_END = 2700;  // 75.7–90s  CTA

// ─── Typography ───────────────────────────────────────────
export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  bold: "700",
  extraBold: "800",
} as const;
