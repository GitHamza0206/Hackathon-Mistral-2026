import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import {
  COLORS,
  SCENE_1_START,
  SCENE_1_END,
  SCENE_2_START,
  SCENE_2_END,
  SCENE_3_START,
  SCENE_3_END,
  SCENE_4_START,
  SCENE_4_END,
  SCENE_5_START,
  SCENE_5_END,
  SCENE_6_START,
  SCENE_6_END,
  SCENE_7_START,
  SCENE_7_END,
  SCENE_8_START,
  SCENE_8_END,
  FPS,
} from "./constants";

import { ProblemCompany } from "./scenes/ProblemCompany";
import { ProblemCandidate } from "./scenes/ProblemCandidate";
import { CernoReveal } from "./scenes/CernoReveal";
import { Pipeline } from "./scenes/Pipeline";
import { HowItWorks } from "./scenes/HowItWorks";
import { Specialization } from "./scenes/Specialization";
import { Metrics } from "./scenes/Metrics";
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
      {/* Act 1: The system is broken */}

      <Sequence
        from={SCENE_1_START}
        durationInFrames={SCENE_1_END - SCENE_1_START}
        premountFor={FPS}
      >
        <ProblemCompany />
      </Sequence>

      <Sequence
        from={SCENE_2_START}
        durationInFrames={SCENE_2_END - SCENE_2_START}
        premountFor={FPS}
      >
        <ProblemCandidate />
      </Sequence>

      {/* Act 2: Cerno replaces the pipeline */}

      <Sequence
        from={SCENE_3_START}
        durationInFrames={SCENE_3_END - SCENE_3_START}
        premountFor={FPS}
      >
        <CernoReveal />
      </Sequence>

      <Sequence
        from={SCENE_4_START}
        durationInFrames={SCENE_4_END - SCENE_4_START}
        premountFor={FPS}
      >
        <Pipeline />
      </Sequence>

      <Sequence
        from={SCENE_5_START}
        durationInFrames={SCENE_5_END - SCENE_5_START}
        premountFor={FPS}
      >
        <HowItWorks />
      </Sequence>

      {/* Act 3: Signal, not noise */}

      <Sequence
        from={SCENE_6_START}
        durationInFrames={SCENE_6_END - SCENE_6_START}
        premountFor={FPS}
      >
        <Specialization />
      </Sequence>

      <Sequence
        from={SCENE_7_START}
        durationInFrames={SCENE_7_END - SCENE_7_START}
        premountFor={FPS}
      >
        <Metrics />
      </Sequence>

      <Sequence
        from={SCENE_8_START}
        durationInFrames={SCENE_8_END - SCENE_8_START}
        premountFor={FPS}
      >
        <CTA />
      </Sequence>

      {/* Background music — uncomment when you add a music file to public/ */}
      {/*
      <Audio
        src={staticFile("music.mp3")}
        volume={(f) => {
          if (f < 150) return interpolate(f, [0, 150], [0, 0.12], CLAMP);
          if (f < 2270) return 0.08;
          if (f < 2500) return interpolate(f, [2270, 2500], [0.08, 0.15], CLAMP);
          return interpolate(f, [2500, 2700], [0.15, 0], CLAMP);
        }}
      />
      */}
    </AbsoluteFill>
  );
};
