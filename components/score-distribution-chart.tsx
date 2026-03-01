"use client";

import type { CandidateSessionRecord } from "@/lib/interviews";

interface ScoreDistributionChartProps {
  sessions: CandidateSessionRecord[];
  rejectThreshold: number;
  advanceThreshold: number;
}

export function ScoreDistributionChart({
  sessions,
  rejectThreshold,
  advanceThreshold,
}: ScoreDistributionChartProps) {
  const scores = sessions
    .filter((s) => s.scorecard && typeof s.scorecard.overallScore === "number")
    .map((s) => s.scorecard!.overallScore);

  if (scores.length < 2) return null;

  const buckets = new Array(10).fill(0) as number[];
  for (const score of scores) {
    const index = Math.min(9, Math.max(0, Math.floor(score / 10)));
    buckets[index]++;
  }

  const maxCount = Math.max(...buckets);

  function barColor(bucketIndex: number) {
    const midScore = bucketIndex * 10 + 5;
    if (midScore < rejectThreshold) return "var(--danger)";
    if (midScore >= advanceThreshold) return "#22c55e";
    return "var(--accent)";
  }

  return (
    <div>
      <svg viewBox="0 0 200 100" className="score-distribution-svg" aria-label="Score distribution histogram">
        {/* Background zones */}
        <rect x="0" y="0" width={rejectThreshold * 2} height="100" fill="rgba(255,123,123,0.06)" />
        <rect
          x={rejectThreshold * 2}
          y="0"
          width={(advanceThreshold - rejectThreshold) * 2}
          height="100"
          fill="rgba(167,139,250,0.06)"
        />
        <rect
          x={advanceThreshold * 2}
          y="0"
          width={(100 - advanceThreshold) * 2}
          height="100"
          fill="rgba(34,197,94,0.06)"
        />

        {/* Bars */}
        {buckets.map((count, i) => {
          if (count === 0) return null;
          const barHeight = maxCount > 0 ? (count / maxCount) * 75 : 0;
          const x = i * 20;
          return (
            <rect
              key={i}
              x={x + 2}
              y={90 - barHeight}
              width="16"
              height={barHeight}
              fill={barColor(i)}
              rx="2"
              opacity="0.8"
            />
          );
        })}

        {/* Threshold lines */}
        <line
          x1={rejectThreshold * 2}
          y1="0"
          x2={rejectThreshold * 2}
          y2="95"
          stroke="var(--danger)"
          strokeWidth="0.5"
          strokeDasharray="3,2"
        />
        <line
          x1={advanceThreshold * 2}
          y1="0"
          x2={advanceThreshold * 2}
          y2="95"
          stroke="#22c55e"
          strokeWidth="0.5"
          strokeDasharray="3,2"
        />

        {/* Axis line */}
        <line x1="0" y1="90" x2="200" y2="90" stroke="var(--muted)" strokeWidth="0.3" opacity="0.4" />
      </svg>
      <div className="score-distribution-legend">
        <span>0</span>
        <span>Reject &lt; {rejectThreshold}</span>
        <span>Review</span>
        <span>Advance &ge; {advanceThreshold}</span>
        <span>100</span>
      </div>
    </div>
  );
}
