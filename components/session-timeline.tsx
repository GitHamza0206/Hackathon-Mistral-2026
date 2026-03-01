"use client";

import type { CandidateSessionRecord } from "@/lib/interviews";

interface SessionTimelineProps {
  sessions: CandidateSessionRecord[];
}

function formatTimeLabel(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

export function SessionTimeline({ sessions }: SessionTimelineProps) {
  const withTimes = sessions.filter((s) => s.sessionStartedAt);

  if (withTimes.length === 0) return null;

  const timestamps = withTimes.flatMap((s) => {
    const times: number[] = [];
    if (s.sessionStartedAt) times.push(Date.parse(s.sessionStartedAt));
    if (s.sessionEndedAt) times.push(Date.parse(s.sessionEndedAt));
    return times.filter((t) => !Number.isNaN(t));
  });

  const globalStartMs = Math.min(...timestamps);
  const globalEndMs = Math.max(...timestamps, Date.now());
  const spanMs = Math.max(globalEndMs - globalStartMs, 1);

  const sorted = [...withTimes].sort((a, b) => {
    const aMs = Date.parse(a.sessionStartedAt!);
    const bMs = Date.parse(b.sessionStartedAt!);
    return aMs - bMs;
  });

  return (
    <div className="session-timeline">
      <div className="timeline-axis">
        <span>{formatTimeLabel(new Date(globalStartMs))}</span>
        <span>{formatTimeLabel(new Date(globalEndMs))}</span>
      </div>
      <div className="timeline-tracks">
        {sorted.map((session) => {
          const startMs = Date.parse(session.sessionStartedAt!);
          const endMs = session.sessionEndedAt
            ? Date.parse(session.sessionEndedAt)
            : Date.now();
          const left = ((startMs - globalStartMs) / spanMs) * 100;
          const width = Math.max(1, ((endMs - startMs) / spanMs) * 100);
          const isActive = session.status === "in_progress";

          return (
            <div key={session.id} className="timeline-row">
              <span className="timeline-candidate-name">
                {session.candidateProfile.candidateName}
              </span>
              <div className="timeline-track">
                <div
                  className={`timeline-bar${isActive ? " timeline-bar-active" : ""}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${session.candidateProfile.candidateName}: ${formatTimeLabel(new Date(startMs))} — ${formatTimeLabel(new Date(endMs))}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
