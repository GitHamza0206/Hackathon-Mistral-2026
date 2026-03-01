import { Composition } from "remotion";
import { CernoDemo } from "./CernoDemo";
import { TOTAL_FRAMES, FPS } from "./constants";

export const RemotionRoot = () => {
  return (
    <Composition
      id="CernoDemo"
      component={CernoDemo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
