import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { CLAMP, COLORS } from "../constants";

interface StatCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  delayFrames?: number;
  durationFrames?: number;
  fontSize?: number;
  color?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  target,
  suffix = "",
  prefix = "",
  delayFrames = 0,
  durationFrames = 40,
  fontSize = 120,
  color = COLORS.indigo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delayFrames, delayFrames + durationFrames],
    [0, 1],
    CLAMP,
  );

  // Ease-out cubic for satisfying deceleration
  const eased = 1 - Math.pow(1 - progress, 3);
  const current = Math.round(eased * target);

  const opacity = interpolate(frame, [delayFrames, delayFrames + 10], [0, 1], CLAMP);

  return (
    <span
      style={{
        fontSize,
        fontWeight: 800,
        color,
        opacity,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {prefix}
      {current}
      {suffix}
    </span>
  );
};
