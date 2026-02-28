import React from "react";
import { COLORS } from "../constants";

type CVCardProps = {
  name: string;
  role: string;
  rotation: number;
};

export const CVCard: React.FC<CVCardProps> = ({ name, role, rotation }) => {
  return (
    <div
      style={{
        width: 180,
        padding: "14px 18px",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 10,
        transform: `rotate(${rotation}deg)`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#1a1a2e",
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: 11,
          color: COLORS.muted,
          fontWeight: 500,
        }}
      >
        {role}
      </div>
    </div>
  );
};
