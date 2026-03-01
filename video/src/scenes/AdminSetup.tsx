import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";
import { BrowserFrame } from "../components/BrowserFrame";
import { TypewriterText } from "../components/TypewriterText";
import { FileText, ScanLine, CheckCircle2 } from "lucide-react";

export const AdminSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionOpacity = interpolate(frame, [180, 200], [0, 1], CLAMP);
  const captionY = interpolate(frame, [180, 200], [10, 0], CLAMP);

  // PDF appears
  const pdfEntrance = spring({ frame: frame - 15, fps, config: SPRING_CONFIG });
  // OCR scan line animation
  const scanProgress = interpolate(frame, [50, 100], [0, 1], CLAMP);
  const scanVisible = frame >= 50 && frame <= 110;
  // Extracted fields appear
  const extractedEntrance = spring({ frame: frame - 95, fps, config: SPRING_CONFIG });

  const OCR_FIELDS = [
    { label: "Role", value: "Senior ML Engineer", delay: 100 },
    { label: "Seniority", value: "Senior (5+ years)", delay: 112 },
    { label: "Focus areas", value: "LLM engineering, System design, RAG", delay: 124 },
    { label: "Team", value: "AI Platform", delay: 136 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <BrowserFrame url="app.cerno.ai/admin/roles/new" delayFrames={5}>
        <div style={{ padding: "28px 48px", display: "flex", gap: 36 }}>
          {/* Left: PDF Document */}
          <div
            style={{
              flex: 1,
              opacity: pdfEntrance,
              transform: `scale(${interpolate(pdfEntrance, [0, 1], [0.92, 1])})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <FileText size={16} color={COLORS.appAccent} />
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Uploaded JD
              </span>
            </div>

            {/* PDF preview */}
            <div
              style={{
                position: "relative",
                background: "#fff",
                border: `1px solid ${COLORS.appBorder}`,
                borderRadius: 10,
                padding: "20px 18px",
                minHeight: 280,
                overflow: "hidden",
              }}
            >
              {/* Fake PDF content lines */}
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.appInk, marginBottom: 10 }}>
                Senior ML Engineer
              </div>
              <div style={{ fontSize: 11, color: COLORS.appInk, marginBottom: 6, fontWeight: 600 }}>
                AI Platform Team
              </div>
              {[85, 95, 70, 90, 60, 80, 75, 50, 95, 65, 85, 40].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 6,
                    width: `${w}%`,
                    borderRadius: 3,
                    background: COLORS.appBorder,
                    marginBottom: 6,
                  }}
                />
              ))}

              {/* Scan line */}
              {scanVisible && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${scanProgress * 100}%`,
                    height: 3,
                    background: `linear-gradient(90deg, transparent, ${COLORS.appAccent}, transparent)`,
                    boxShadow: `0 0 20px ${COLORS.appAccent}60`,
                  }}
                />
              )}

              {/* Scan overlay */}
              {scanVisible && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to bottom, ${COLORS.appAccent}06, transparent ${scanProgress * 100}%)`,
                  }}
                />
              )}
            </div>

            {/* OCR badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
                opacity: interpolate(frame, [45, 55], [0, 1], CLAMP),
              }}
            >
              <ScanLine size={14} color={COLORS.appAccent} />
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.appAccent }}>
                {frame < 100 ? "Extracting information via OCR..." : "OCR extraction complete"}
              </span>
              {frame >= 100 && <CheckCircle2 size={14} color={COLORS.appSuccess} />}
            </div>
          </div>

          {/* Right: Extracted fields */}
          <div
            style={{
              flex: 1,
              opacity: extractedEntrance,
              transform: `translateX(${interpolate(extractedEntrance, [0, 1], [20, 0])}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <CheckCircle2 size={16} color={COLORS.appSuccess} />
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Auto-extracted
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {OCR_FIELDS.map((field) => {
                const fieldOpacity = interpolate(frame, [field.delay, field.delay + 12], [0, 1], CLAMP);
                return (
                  <div key={field.label} style={{ opacity: fieldOpacity }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.appMuted, marginBottom: 4 }}>
                      {field.label}
                    </p>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: `1px solid ${COLORS.appSuccess}30`,
                        background: `${COLORS.appSuccess}06`,
                        fontSize: 14,
                        fontWeight: 600,
                        color: COLORS.appInk,
                      }}
                    >
                      {field.value}
                    </div>
                  </div>
                );
              })}

              {/* Create button */}
              <div style={{ opacity: interpolate(frame, [155, 165], [0, 1], CLAMP), marginTop: 8 }}>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "10px 24px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.appAccent}, ${COLORS.violet})`,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Create role →
                </div>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>

      {/* Caption */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.text,
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        Upload a JD. <span style={{ color: COLORS.indigo }}>Cerno does the rest.</span>
      </p>
    </AbsoluteFill>
  );
};
