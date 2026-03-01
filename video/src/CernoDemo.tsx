import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import {
  COLORS,
  FPS,
  SCENE_1_START, SCENE_1_END,
  SCENE_2_START, SCENE_2_END,
  SCENE_3_START, SCENE_3_END,
  SCENE_4_START, SCENE_4_END,
  SCENE_5_START, SCENE_5_END,
  SCENE_6_START, SCENE_6_END,
  SCENE_7_START, SCENE_7_END,
  SCENE_8_START, SCENE_8_END,
  SCENE_9_START, SCENE_9_END,
  SCENE_10_START, SCENE_10_END,
  SCENE_11_START, SCENE_11_END,
  SCENE_12_START, SCENE_12_END,
  SCENE_13_START, SCENE_13_END,
  SCENE_14_START, SCENE_14_END,
  SCENE_15_START, SCENE_15_END,
} from "./constants";

// Scenes
import { StatHook } from "./scenes/StatHook";
import { SplitProblem } from "./scenes/SplitProblem";
import { CernoReveal } from "./scenes/CernoReveal";
import { ThreeSteps } from "./scenes/ThreeSteps";
import { AdminSetup } from "./scenes/AdminSetup";
import { AdminDashboard } from "./scenes/AdminDashboard";
import { AdminScorecard } from "./scenes/AdminScorecard";
import { CandidateApply } from "./scenes/CandidateApply";
import { CandidateChecklist } from "./scenes/CandidateChecklist";
import { LiveInterview } from "./scenes/LiveInterview";
import { ComparisonView } from "./scenes/ComparisonView";
import { Analytics } from "./scenes/Analytics";
import { Domains } from "./scenes/Domains";
import { Outcomes } from "./scenes/Outcomes";
import { CTA } from "./scenes/CTA";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "700", "800"],
  subsets: ["latin"],
});

export const CernoDemo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        fontFamily,
        background: COLORS.bg,
      }}
    >
      {/* Act 1: Hook & Problem */}
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_END - SCENE_1_START} premountFor={FPS}>
        <StatHook />
      </Sequence>

      <Sequence from={SCENE_2_START} durationInFrames={SCENE_2_END - SCENE_2_START} premountFor={FPS}>
        <SplitProblem />
      </Sequence>

      {/* Act 2: The Solution */}
      <Sequence from={SCENE_3_START} durationInFrames={SCENE_3_END - SCENE_3_START} premountFor={FPS}>
        <CernoReveal />
      </Sequence>

      <Sequence from={SCENE_4_START} durationInFrames={SCENE_4_END - SCENE_4_START} premountFor={FPS}>
        <ThreeSteps />
      </Sequence>

      {/* Act 3: Product — Admin View */}
      <Sequence from={SCENE_5_START} durationInFrames={SCENE_5_END - SCENE_5_START} premountFor={FPS}>
        <AdminSetup />
      </Sequence>

      <Sequence from={SCENE_6_START} durationInFrames={SCENE_6_END - SCENE_6_START} premountFor={FPS}>
        <AdminDashboard />
      </Sequence>

      <Sequence from={SCENE_7_START} durationInFrames={SCENE_7_END - SCENE_7_START} premountFor={FPS}>
        <AdminScorecard />
      </Sequence>

      {/* Act 4: Product — Candidate View */}
      <Sequence from={SCENE_8_START} durationInFrames={SCENE_8_END - SCENE_8_START} premountFor={FPS}>
        <CandidateApply />
      </Sequence>

      <Sequence from={SCENE_9_START} durationInFrames={SCENE_9_END - SCENE_9_START} premountFor={FPS}>
        <CandidateChecklist />
      </Sequence>

      <Sequence from={SCENE_10_START} durationInFrames={SCENE_10_END - SCENE_10_START} premountFor={FPS}>
        <LiveInterview />
      </Sequence>

      {/* Act 5: Analytics & Power */}
      <Sequence from={SCENE_11_START} durationInFrames={SCENE_11_END - SCENE_11_START} premountFor={FPS}>
        <ComparisonView />
      </Sequence>

      <Sequence from={SCENE_12_START} durationInFrames={SCENE_12_END - SCENE_12_START} premountFor={FPS}>
        <Analytics />
      </Sequence>

      <Sequence from={SCENE_13_START} durationInFrames={SCENE_13_END - SCENE_13_START} premountFor={FPS}>
        <Domains />
      </Sequence>

      {/* Act 6: Impact & Close */}
      <Sequence from={SCENE_14_START} durationInFrames={SCENE_14_END - SCENE_14_START} premountFor={FPS}>
        <Outcomes />
      </Sequence>

      <Sequence from={SCENE_15_START} durationInFrames={SCENE_15_END - SCENE_15_START} premountFor={FPS}>
        <CTA />
      </Sequence>

      {/* Background music — uncomment when you add a music file to public/ */}
      {/*
      <Audio
        src={staticFile("music.mp3")}
        volume={(f) => {
          if (f < 200) return interpolate(f, [0, 200], [0, 0.12], CLAMP);
          if (f < 2760) return 0.08;
          if (f < 3120) return interpolate(f, [2760, 3120], [0.08, 0.15], CLAMP);
          if (f < 3480) return 0.15;
          return interpolate(f, [3480, 3600], [0.15, 0], CLAMP);
        }}
      />
      */}
    </AbsoluteFill>
  );
};
