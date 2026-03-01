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

// Act 1: Hook & Problem (0–16s)
export const SCENE_1_START = 0;
export const SCENE_1_END = 240;     // 0–8s     StatHook

export const SCENE_2_START = 240;
export const SCENE_2_END = 480;     // 8–16s    SplitProblem

// Act 2: The Solution (16–28s)
export const SCENE_3_START = 480;
export const SCENE_3_END = 660;     // 16–22s   CernoReveal

export const SCENE_4_START = 660;
export const SCENE_4_END = 840;     // 22–28s   ThreeSteps

// Act 3: Product — Admin View (28–50s)
export const SCENE_5_START = 840;
export const SCENE_5_END = 1080;    // 28–36s   AdminSetup

export const SCENE_6_START = 1080;
export const SCENE_6_END = 1320;    // 36–44s   AdminDashboard

export const SCENE_7_START = 1320;
export const SCENE_7_END = 1500;    // 44–50s   AdminScorecard

// Act 4: Product — Candidate View (50–72s)
export const SCENE_8_START = 1500;
export const SCENE_8_END = 1680;    // 50–56s   CandidateApply

export const SCENE_9_START = 1680;
export const SCENE_9_END = 1860;    // 56–62s   CandidateChecklist

export const SCENE_10_START = 1860;
export const SCENE_10_END = 2160;   // 62–72s   LiveInterview (HERO)

// Act 5: Analytics & Power (72–92s)
export const SCENE_11_START = 2160;
export const SCENE_11_END = 2400;   // 72–80s   ComparisonView

export const SCENE_12_START = 2400;
export const SCENE_12_END = 2580;   // 80–86s   Analytics

export const SCENE_13_START = 2580;
export const SCENE_13_END = 2760;   // 86–92s   Domains

// Act 6: Impact & Close (92–120s)
export const SCENE_14_START = 2760;
export const SCENE_14_END = 3120;   // 92–104s  Outcomes

export const SCENE_15_START = 3120;
export const SCENE_15_END = 3600;   // 104–120s CTA

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
