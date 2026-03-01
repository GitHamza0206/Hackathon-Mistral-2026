import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, CLAMP, SPRING_CONFIG } from "../constants";

// Simulated score distribution across 10 buckets
const BUCKET_COUNTS = [0, 1, 0, 2, 3, 4, 2, 3, 1, 1]; // 0-9, 10-19, ..., 90-100
const MAX_COUNT = Math.max(...BUCKET_COUNTS);

export const MockHistogram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.appMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
        Score distribution
      </p>
      <svg viewBox="0 0 600 320" width="100%" style={{ flex: 1 }}>
        {/* Background zones */}
        <rect x={40} y={10} width={560 * 0.4} height={260} fill={`${COLORS.appDanger}08`} />
        <rect x={40 + 560 * 0.4} y={10} width={560 * 0.5} height={260} fill={`${COLORS.appAccent}06`} />
        <rect x={40 + 560 * 0.9} y={10} width={560 * 0.1} height={260} fill={`${COLORS.appSuccess}08`} />

        {/* Threshold lines */}
        <line
          x1={40 + 560 * 0.4} y1={10}
          x2={40 + 560 * 0.4} y2={270}
          stroke={COLORS.appDanger}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.6}
        />
        <line
          x1={40 + 560 * 0.9} y1={10}
          x2={40 + 560 * 0.9} y2={270}
          stroke={COLORS.appSuccess}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          opacity={0.6}
        />

        {/* Threshold labels */}
        <text x={40 + 560 * 0.4} y={290} fontSize={11} fill={COLORS.appDanger} textAnchor="middle" fontWeight={600}>
          Reject: 40
        </text>
        <text x={40 + 560 * 0.9} y={290} fontSize={11} fill={COLORS.appSuccess} textAnchor="middle" fontWeight={600}>
          Accept: 90
        </text>

        {/* Bars */}
        {BUCKET_COUNTS.map((count, i) => {
          const barDelay = 10 + i * 6;
          const barEntrance = spring({
            frame: frame - barDelay,
            fps,
            config: SPRING_CONFIG,
          });
          const barWidth = 48;
          const gap = 8;
          const chartHeight = 250;
          const barHeight = (count / MAX_COUNT) * chartHeight * barEntrance;
          const x = 40 + i * (barWidth + gap) + gap / 2;
          const y = 10 + chartHeight - barHeight;

          let fill: string = COLORS.appAccent;
          if (i < 4) fill = COLORS.appDanger;
          else if (i >= 9) fill = COLORS.appSuccess;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, barHeight)}
                rx={5}
                fill={fill}
                opacity={0.8}
              />
              {/* Count label */}
              {count > 0 && barEntrance > 0.5 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  fontSize={12}
                  fill={fill}
                  textAnchor="middle"
                  fontWeight={700}
                  opacity={interpolate(barEntrance, [0.5, 1], [0, 1])}
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {[0, 20, 40, 60, 80, 100].map((label) => (
          <text
            key={label}
            x={40 + (label / 100) * (10 * 56)}
            y={310}
            fontSize={12}
            fill={COLORS.appMuted}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
};
