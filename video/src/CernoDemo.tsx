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
  SCENE_16_START, SCENE_16_END,
  SCENE_17_START, SCENE_17_END,
  SCENE_18_START, SCENE_18_END,
} from "./constants";

// Act 1: The Problem
import { ApplicationMontage } from "./scenes/ApplicationMontage";
import { HRRejection } from "./scenes/HRRejection";
import { RejectionEmail } from "./scenes/RejectionEmail";
import { PainPoints } from "./scenes/PainPoints";
import { BrokenRecruitment } from "./scenes/BrokenRecruitment";
import { KeyPhrase } from "./scenes/KeyPhrase";
import { CernoReveal } from "./scenes/CernoReveal";

// Act 2: Product — Admin View
import { AdminSetup } from "./scenes/AdminSetup";
import { AdminDashboard } from "./scenes/AdminDashboard";
import { AdminScorecard } from "./scenes/AdminScorecard";

// Act 3: Product — Candidate View
import { CandidateApply } from "./scenes/CandidateApply";
import { CandidateChecklist } from "./scenes/CandidateChecklist";
import { LiveInterview } from "./scenes/LiveInterview";

// Act 4: Analytics & Power
import { ComparisonView } from "./scenes/ComparisonView";
import { Analytics } from "./scenes/Analytics";
import { Domains } from "./scenes/Domains";

// Act 5: Impact & Close
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
      {/* Act 1: The Problem */}
      <Sequence from={SCENE_1_START} durationInFrames={SCENE_1_END - SCENE_1_START} premountFor={FPS}>
        <ApplicationMontage />
      </Sequence>

      <Sequence from={SCENE_2_START} durationInFrames={SCENE_2_END - SCENE_2_START} premountFor={FPS}>
        <HRRejection />
      </Sequence>

      <Sequence from={SCENE_3_START} durationInFrames={SCENE_3_END - SCENE_3_START} premountFor={FPS}>
        <RejectionEmail />
      </Sequence>

      <Sequence from={SCENE_4_START} durationInFrames={SCENE_4_END - SCENE_4_START} premountFor={FPS}>
        <PainPoints />
      </Sequence>

      <Sequence from={SCENE_5_START} durationInFrames={SCENE_5_END - SCENE_5_START} premountFor={FPS}>
        <BrokenRecruitment />
      </Sequence>

      <Sequence from={SCENE_6_START} durationInFrames={SCENE_6_END - SCENE_6_START} premountFor={FPS}>
        <KeyPhrase />
      </Sequence>

      <Sequence from={SCENE_7_START} durationInFrames={SCENE_7_END - SCENE_7_START} premountFor={FPS}>
        <CernoReveal />
      </Sequence>

      {/* Act 2: Product — Admin View */}
      <Sequence from={SCENE_8_START} durationInFrames={SCENE_8_END - SCENE_8_START} premountFor={FPS}>
        <AdminSetup />
      </Sequence>

      <Sequence from={SCENE_9_START} durationInFrames={SCENE_9_END - SCENE_9_START} premountFor={FPS}>
        <AdminDashboard />
      </Sequence>

      <Sequence from={SCENE_10_START} durationInFrames={SCENE_10_END - SCENE_10_START} premountFor={FPS}>
        <AdminScorecard />
      </Sequence>

      {/* Act 3: Product — Candidate View */}
      <Sequence from={SCENE_11_START} durationInFrames={SCENE_11_END - SCENE_11_START} premountFor={FPS}>
        <CandidateApply />
      </Sequence>

      <Sequence from={SCENE_12_START} durationInFrames={SCENE_12_END - SCENE_12_START} premountFor={FPS}>
        <CandidateChecklist />
      </Sequence>

      <Sequence from={SCENE_13_START} durationInFrames={SCENE_13_END - SCENE_13_START} premountFor={FPS}>
        <LiveInterview />
      </Sequence>

      {/* Act 4: Analytics & Power */}
      <Sequence from={SCENE_14_START} durationInFrames={SCENE_14_END - SCENE_14_START} premountFor={FPS}>
        <ComparisonView />
      </Sequence>

      <Sequence from={SCENE_15_START} durationInFrames={SCENE_15_END - SCENE_15_START} premountFor={FPS}>
        <Analytics />
      </Sequence>

      <Sequence from={SCENE_16_START} durationInFrames={SCENE_16_END - SCENE_16_START} premountFor={FPS}>
        <Domains />
      </Sequence>

      {/* Act 5: Impact & Close */}
      <Sequence from={SCENE_17_START} durationInFrames={SCENE_17_END - SCENE_17_START} premountFor={FPS}>
        <Outcomes />
      </Sequence>

      <Sequence from={SCENE_18_START} durationInFrames={SCENE_18_END - SCENE_18_START} premountFor={FPS}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
