import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { Brain, Cpu, BarChart3, Code } from "lucide-react";

const DOMAINS = [
  {
    icon: Brain,
    title: "AI Engineering",
    color: COLORS.indigo,
    skills: ["Transformer architecture", "Training pipelines", "Model evaluation", "Inference optimization", "RAG systems"],
  },
  {
    icon: Cpu,
    title: "ML & LLMs",
    color: COLORS.violet,
    skills: ["Fine-tuning strategies", "Prompt engineering", "Distributed training", "Feature engineering", "MLOps"],
  },
  {
    icon: BarChart3,
    title: "Data Science",
    color: COLORS.lavender,
    skills: ["Statistical modeling", "Experiment design", "Causal inference", "Data visualization", "Business metrics"],
  },
  {
    icon: Code,
    title: "Software Eng.",
    color: COLORS.green,
    skills: ["System design", "API architecture", "Concurrency patterns", "Database modeling", "Performance tuning"],
  },
];

export const Domains: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(frame, [5, 25], [0, 1], CLAMP);
  const exitOpacity = interpolate(frame, [265, 295], [1, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
        padding: "60px 80px",
        opacity: exitOpacity,
      }}
    >
      <p
        style={{
          fontSize: 40,
          fontWeight: 600,
          color: COLORS.text,
          opacity: headlineOpacity,
          textAlign: "center",
        }}
      >
        AI · ML · Data Science · SWE.{" "}
        <span style={{ color: COLORS.lavender }}>Deep, not generic.</span>
      </p>

      <div style={{ display: "flex", gap: 24 }}>
        {DOMAINS.map((domain, di) => {
          const delay = 25 + di * 20;
          const entrance = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const Icon = domain.icon;

          return (
            <div
              key={domain.title}
              style={{
                flex: 1,
                opacity: entrance,
                transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
                background: `${domain.color}08`,
                border: `1px solid ${domain.color}25`,
                borderRadius: 16,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${domain.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={domain.color} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>
                  {domain.title}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {domain.skills.map((skill, si) => {
                  const skillDelay = delay + 30 + si * 8;
                  const skillOpacity = interpolate(
                    frame,
                    [skillDelay, skillDelay + 12],
                    [0, 1],
                    CLAMP,
                  );
                  return (
                    <span
                      key={skill}
                      style={{
                        fontSize: 15,
                        color: COLORS.muted,
                        opacity: skillOpacity,
                        padding: "4px 0",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
