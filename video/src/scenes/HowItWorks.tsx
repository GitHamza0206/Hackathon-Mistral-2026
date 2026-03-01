import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { FileText, Briefcase, Target, ArrowDown } from "lucide-react";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";
import { InputCard } from "../components/InputCard";
import { WaveForm } from "../components/WaveForm";
import { SpeechBubble } from "../components/SpeechBubble";
import { ScoreCard } from "../components/ScoreCard";

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 450 frames (15s)
  const subtitleOpacity = interpolate(frame, [0, 25], [0, 1], CLAMP);

  // Arrow
  const arrowOpacity = interpolate(frame, [80, 100], [0, 1], CLAMP);
  const arrowLabelOpacity = interpolate(frame, [90, 110], [0, 1], CLAMP);

  // Waveform
  const waveOpacity = interpolate(frame, [110, 130], [0, 1], CLAMP);

  // Speech bubbles — slower timing
  const bubble1Opacity = interpolate(
    frame,
    [130, 145, 195, 210],
    [0, 1, 1, 0],
    CLAMP,
  );
  const bubble2Opacity = interpolate(
    frame,
    [160, 175, 220, 235],
    [0, 1, 1, 0],
    CLAMP,
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        padding: "50px 100px",
      }}
    >
      {/* Subtitle */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.muted,
          textAlign: "center",
          opacity: subtitleOpacity,
          marginBottom: 36,
        }}
      >
        Inside every Cerno interview
      </div>

      {/* Input cards row */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 28,
          marginBottom: 28,
        }}
      >
        <InputCard
          icon={<FileText size={24} />}
          title="Candidate Profile"
          subtitle="CV · GitHub · Portfolio"
          delayFrames={10}
        />
        <InputCard
          icon={<Briefcase size={24} />}
          title="Job Description"
          subtitle="Role · Level · Stack"
          delayFrames={30}
        />
        <InputCard
          icon={<Target size={24} />}
          title="Focus Areas"
          subtitle="Interviewer notes · Stage"
          delayFrames={50}
        />
      </div>

      {/* Arrow */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: arrowOpacity,
          marginBottom: 20,
        }}
      >
        <ArrowDown size={32} color={COLORS.indigo} />
        <div
          style={{
            fontSize: 15,
            color: COLORS.indigo,
            fontWeight: 500,
            opacity: arrowLabelOpacity,
          }}
        >
          Interview generated in seconds
        </div>
      </div>

      {/* Waveform */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          opacity: waveOpacity,
          marginBottom: 24,
        }}
      >
        <WaveForm width={800} height={70} amplitude={25} color={COLORS.indigo} />
      </div>

      {/* Speech bubbles */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
          maxWidth: 900,
          margin: "0 auto",
          marginBottom: 20,
        }}
      >
        <div style={{ opacity: bubble1Opacity, alignSelf: "flex-start", marginLeft: 100 }}>
          <SpeechBubble
            text="Walk me through your approach to training large-scale recommendation systems."
            side="left"
          />
        </div>
        <div style={{ opacity: bubble2Opacity, alignSelf: "flex-end", marginRight: 100 }}>
          <SpeechBubble
            text="I'd start with offline evaluation metrics, then move to an A/B testing framework..."
            side="right"
          />
        </div>
      </div>

      {/* ScoreCard — appears at frame 240 */}
      <Sequence from={240} durationInFrames={210} premountFor={60}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "absolute",
            bottom: 30,
            left: 0,
            right: 0,
          }}
        >
          <ScoreCard />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
