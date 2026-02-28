import React from "react";
import { COLORS } from "../constants";

type SpeechBubbleProps = {
  text: string;
  side: "left" | "right";
  opacity?: number;
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  side,
  opacity = 1,
}) => {
  const isLeft = side === "left";
  const tint = isLeft ? COLORS.indigo : COLORS.lavender;

  return (
    <div
      style={{
        opacity,
        maxWidth: 520,
        padding: "16px 22px",
        background: `${tint}15`,
        border: `1px solid ${tint}30`,
        borderRadius: 16,
        borderBottomLeftRadius: isLeft ? 4 : 16,
        borderBottomRightRadius: isLeft ? 16 : 4,
        alignSelf: isLeft ? "flex-start" : "flex-end",
      }}
    >
      <div
        style={{
          fontSize: 18,
          color: COLORS.text,
          fontWeight: 400,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        {text}
      </div>
    </div>
  );
};
