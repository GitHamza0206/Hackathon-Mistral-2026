import React from "react";
import { COLORS } from "../constants";

type TagPillProps = {
  text: string;
  variant: "green" | "amber";
  opacity?: number;
};

export const TagPill: React.FC<TagPillProps> = ({
  text,
  variant,
  opacity = 1,
}) => {
  const color = variant === "green" ? COLORS.green : COLORS.amber;

  return (
    <div
      style={{
        opacity,
        display: "inline-flex",
        padding: "6px 14px",
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 500,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
