import { useCurrentFrame, interpolate } from "remotion";
import { CLAMP, COLORS } from "../constants";

interface TypewriterTextProps {
  text: string;
  delayFrames?: number;
  charsPerFrame?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  cursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delayFrames = 0,
  charsPerFrame = 0.7,
  fontSize = 24,
  fontWeight = 400,
  color = COLORS.text,
  cursor = true,
}) => {
  const frame = useCurrentFrame();

  const elapsed = Math.max(0, frame - delayFrames);
  const charCount = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const displayed = text.slice(0, charCount);
  const isDone = charCount >= text.length;
  const cursorVisible = cursor && (!isDone || frame % 20 < 10);

  const opacity = interpolate(frame, [delayFrames, delayFrames + 5], [0, 1], CLAMP);

  return (
    <span
      style={{
        fontSize,
        fontWeight,
        color,
        opacity,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}
    >
      {displayed}
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: fontSize * 0.05,
            height: fontSize * 0.85,
            backgroundColor: color,
            marginLeft: 2,
            verticalAlign: "text-bottom",
            opacity: 0.8,
          }}
        />
      )}
    </span>
  );
};
