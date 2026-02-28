import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Brain, Cpu, BarChart3, Code } from "lucide-react";
import { COLORS, SPRING_CONFIG, CLAMP } from "../constants";

const DOMAINS = [
  {
    icon: Brain,
    label: "AI Engineering",
    tint: COLORS.indigo,
    skills: [
      "Transformer architecture",
      "Training pipelines",
      "Model evaluation",
      "Inference optimization",
      "RAG systems",
    ],
  },
  {
    icon: Cpu,
    label: "ML & LLMs",
    tint: COLORS.violet,
    skills: [
      "Fine-tuning strategies",
      "Prompt engineering",
      "Distributed training",
      "Feature engineering",
      "MLOps & deployment",
    ],
  },
  {
    icon: BarChart3,
    label: "Data Science",
    tint: COLORS.lavender,
    skills: [
      "Statistical modeling",
      "Experiment design",
      "Causal inference",
      "Data visualization",
      "Business metrics",
    ],
  },
  {
    icon: Code,
    label: "Software Eng.",
    tint: COLORS.lavender,
    skills: [
      "System design",
      "API architecture",
      "Concurrency patterns",
      "Database modeling",
      "Performance tuning",
    ],
  },
];

export const Specialization: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration: 380 frames
  const headlineEntrance = spring({ frame: frame - 5, fps, config: SPRING_CONFIG });
  const subtextOpacity = interpolate(frame, [280, 310], [0, 1], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "70px 80px",
      }}
    >
      {/* Headline */}
      <div
        style={{
          textAlign: "center",
          opacity: headlineEntrance,
          transform: `translateY(${(1 - headlineEntrance) * 20}px)`,
          marginBottom: 60,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.text }}>
          Purpose-built for technical depth.
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: COLORS.muted,
            marginTop: 12,
          }}
        >
          Every interview is tailored to the domain, role, and stage.
        </div>
      </div>

      {/* 4 domain columns with cascading skills */}
      <div
        style={{
          display: "flex",
          gap: 28,
          justifyContent: "center",
          width: "100%",
        }}
      >
        {DOMAINS.map((domain, di) => {
          const colEntrance = spring({
            frame: frame - 40 - di * 25,
            fps,
            config: SPRING_CONFIG,
          });

          const Icon = domain.icon;

          return (
            <div
              key={di}
              style={{
                opacity: colEntrance,
                transform: `translateY(${(1 - colEntrance) * 40}px)`,
                flex: 1,
                maxWidth: 380,
              }}
            >
              {/* Column header */}
              <div
                style={{
                  background: `${domain.tint}10`,
                  border: `1px solid ${domain.tint}30`,
                  borderRadius: 16,
                  padding: "24px 24px 20px",
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                <Icon
                  size={32}
                  color={domain.tint}
                  style={{ marginBottom: 10 }}
                />
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.text,
                  }}
                >
                  {domain.label}
                </div>
              </div>

              {/* Cascading skill tags */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {domain.skills.map((skill, si) => {
                  const skillEntrance = spring({
                    frame: frame - 80 - di * 25 - si * 12,
                    fps,
                    config: { damping: 20, stiffness: 100 },
                  });

                  return (
                    <div
                      key={si}
                      style={{
                        opacity: skillEntrance,
                        transform: `translateY(${(1 - skillEntrance) * 15}px)`,
                        background: COLORS.bgCard,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 10,
                        padding: "10px 16px",
                        fontSize: 15,
                        fontWeight: 400,
                        color: COLORS.text,
                        textAlign: "center",
                      }}
                    >
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtext */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          textAlign: "center",
          opacity: subtextOpacity,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 400, color: COLORS.muted }}>
          Not generic screening. Deep, domain-specific evaluation.
        </div>
      </div>
    </AbsoluteFill>
  );
};
