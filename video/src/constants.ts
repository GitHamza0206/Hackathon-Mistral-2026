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

// ── Act 1: The Problem (0–43s) ──────────────────────────
export const SCENE_1_START = 0;
export const SCENE_1_END = 270;     // 0–9s     ApplicationMontage

export const SCENE_2_START = 270;
export const SCENE_2_END = 480;     // 9–16s    HRRejection

export const SCENE_3_START = 480;
export const SCENE_3_END = 660;     // 16–22s   RejectionEmail

export const SCENE_4_START = 660;
export const SCENE_4_END = 810;     // 22–27s   PainPoints (shorter)

export const SCENE_5_START = 810;
export const SCENE_5_END = 1050;    // 27–35s   BrokenRecruitment

export const SCENE_6_START = 1050;
export const SCENE_6_END = 1260;    // 35–42s   KeyPhrase

export const SCENE_7_START = 1260;
export const SCENE_7_END = 1530;    // 42–51s   CernoReveal

// ── Act 2: Product — Setup + Live Interview (51–80s) ────
export const SCENE_8_START = 1530;
export const SCENE_8_END = 1800;    // 51–60s   AdminSetup

export const SCENE_9_START = 1800;
export const SCENE_9_END = 2010;    // 60–67s   CandidateApply

export const SCENE_10_START = 2010;
export const SCENE_10_END = 2400;   // 67–80s   LiveInterview (HERO)

// ── Act 3: Review + Specialization (80–100s) ────────────
export const SCENE_11_START = 2400;
export const SCENE_11_END = 2550;   // 80–85s   ComparisonView

export const SCENE_12_START = 2550;
export const SCENE_12_END = 2700;   // 85–90s   AdminDashboard

export const SCENE_13_START = 2700;
export const SCENE_13_END = 3000;   // 90–100s  Domains (longer)

// ── Act 4: Impact & Close (100–120s) ────────────────────
export const SCENE_14_START = 3000;
export const SCENE_14_END = 3180;   // 100–106s Outcomes (shorter)

export const SCENE_15_START = 3180;
export const SCENE_15_END = 3600;   // 106–120s CTA (finale)

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
