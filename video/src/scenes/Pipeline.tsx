import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../constants";
import { PipelineTrack } from "../components/PipelineTrack";

export const Pipeline: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <PipelineTrack />
    </AbsoluteFill>
  );
};
