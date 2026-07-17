import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { useApp } from "@pixi/react";
import { ChibiPlayer } from "../../utils/ChibiPlayer/ChibiPlayer";

const ChibiStage = forwardRef<
  { player: ChibiPlayer | null },
  { stageSize: [number, number] }
>(({ stageSize }, ref) => {
  const app = useApp();
  const player = useRef<ChibiPlayer | null>(null);
  useImperativeHandle(ref, () => ({
    player: player.current,
  }));
  useEffect(() => {
    if (player.current) player.current.setStageSize(stageSize);
  }, [stageSize]);
  useEffect(() => {
    player.current = new ChibiPlayer(app, stageSize);
    return () => {
      if (player.current) {
        player.current.destroy();
        player.current = null;
      }
    };
  }, []);
  return null;
});

ChibiStage.displayName = "ChibiStage";
export default ChibiStage;
