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
  red: "#EF4444",
  // App UI colors (light mode product)
  appBg: "#faf8ff",
  appPanel: "rgba(255,255,255,0.92)",
  appInk: "#1f2140",
  appMuted: "#6e7092",
  appBorder: "rgba(99,102,241,0.14)",
  appAccent: "#6366F1",
  appDanger: "#ff7b7b",
  appSuccess: "#22c55e",
} as const;

// ─── Spring config ────────────────────────────────────────
export const SPRING_CONFIG = { damping: 14, stiffness: 80 } as const;
export const SPRING_SMOOTH = { damping: 200 } as const;
export const SPRING_SNAPPY = { damping: 20, stiffness: 140 } as const;
export const SPRING_GENTLE = { damping: 25, stiffness: 60 } as const;

// ─── Interpolate defaults ─────────────────────────────────
export const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── Scene boundaries (in frames, 30 fps) ─────────────────
export const FPS = 30;
export const TOTAL_FRAMES = 3600; // 120 seconds

// ── Act 1: The Problem (0–44s) ──────────────────────────
export const SCENE_1_START = 0;
export const SCENE_1_END = 210;     // 0–7s     ApplicationMontage

export const SCENE_2_START = 210;
export const SCENE_2_END = 390;     // 7–13s    HRRejection

export const SCENE_3_START = 390;
export const SCENE_3_END = 540;     // 13–18s   RejectionEmail

export const SCENE_4_START = 540;
export const SCENE_4_END = 780;     // 18–26s   PainPoints

export const SCENE_5_START = 780;
export const SCENE_5_END = 930;     // 26–31s   BrokenRecruitment

export const SCENE_6_START = 930;
export const SCENE_6_END = 1110;    // 31–37s   KeyPhrase

export const SCENE_7_START = 1110;
export const SCENE_7_END = 1320;    // 37–44s   CernoReveal

// ── Act 2: Product — Admin View (44–58s) ────────────────
export const SCENE_8_START = 1320;
export const SCENE_8_END = 1530;    // 44–51s   AdminSetup

export const SCENE_9_START = 1530;
export const SCENE_9_END = 1740;    // 51–58s   AdminDashboard

export const SCENE_10_START = 1740;
export const SCENE_10_END = 1890;   // 58–63s   AdminScorecard

// ── Act 3: Product — Candidate View (63–85s) ────────────
export const SCENE_11_START = 1890;
export const SCENE_11_END = 2070;   // 63–69s   CandidateApply

export const SCENE_12_START = 2070;
export const SCENE_12_END = 2250;   // 69–75s   CandidateChecklist

export const SCENE_13_START = 2250;
export const SCENE_13_END = 2550;   // 75–85s   LiveInterview (HERO)

// ── Act 4: Analytics & Power (85–103s) ──────────────────
export const SCENE_14_START = 2550;
export const SCENE_14_END = 2730;   // 85–91s   ComparisonView

export const SCENE_15_START = 2730;
export const SCENE_15_END = 2910;   // 91–97s   Analytics

export const SCENE_16_START = 2910;
export const SCENE_16_END = 3090;   // 97–103s  Domains

// ── Act 5: Impact & Close (103–120s) ────────────────────
export const SCENE_17_START = 3090;
export const SCENE_17_END = 3330;   // 103–111s Outcomes

export const SCENE_18_START = 3330;
export const SCENE_18_END = 3600;   // 111–120s CTA

// ─── Typography ───────────────────────────────────────────
export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  bold: "700",
  extraBold: "800",
} as const;

// ─── Mock data for product UI scenes ──────────────────────
export const MOCK_SCORECARD = {
  overallScore: 82,
  recommendation: "Accepted",
  seniorityEstimate: "Senior",
  dimensions: [
    { label: "Technical depth", score: 85 },
    { label: "LLM engineering", score: 78 },
    { label: "Coding & debugging", score: 80 },
    { label: "System design", score: 88 },
    { label: "Communication", score: 79 },
  ],
  strengths: [
    "Deep knowledge of transformer architectures",
    "Strong system design intuition",
    "Clear communication of complex concepts",
  ],
  concerns: [
    "Limited distributed training experience",
    "Could improve evaluation framework design",
  ],
} as const;

export const MOCK_CANDIDATES = [
  { name: "Alex Chen", score: 82, recommendation: "Accepted", seniority: "Senior" },
  { name: "Priya Sharma", score: 91, recommendation: "Strong Acceptance", seniority: "Senior" },
  { name: "Marcus Davis", score: 54, recommendation: "Under Review", seniority: "Mid" },
] as const;

export const MOCK_TRANSCRIPT = [
  { speaker: "agent" as const, text: "Walk me through how you'd design a RAG pipeline for a production system." },
  { speaker: "candidate" as const, text: "I'd start with the retrieval layer — chunking strategy matters a lot here..." },
  { speaker: "agent" as const, text: "How would you evaluate retrieval quality before deploying?" },
  { speaker: "candidate" as const, text: "I'd set up offline evaluation with annotated query-document pairs..." },
] as const;
