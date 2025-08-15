import { useRef, forwardRef, useImperativeHandle, useEffect } from "react";

import { useApp } from "@pixi/react";

import { extensions, TickerPlugin } from "pixi.js";
extensions.add(TickerPlugin);

import { Live2DController } from "../../utils/Live2DPlayer/Live2DController";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import type {
  ILive2DControllerData,
  ILive2DLoadProgressHandler,
} from "../../utils/Live2DPlayer/types.d";

const StoryReaderLive2DStage = forwardRef<
  { controller: Live2DController; reloadStage: () => void },
  {
    stageSize: [number, number];
    controllerData: ILive2DControllerData;
    onModelLoad: (status: LoadStatus) => void;
    onRenderProgress: ILive2DLoadProgressHandler;
  }
>(({ stageSize, controllerData, onModelLoad, onRenderProgress }, ref) => {
  const app = useApp();
  const controller = useRef<Live2DController>();
  useImperativeHandle(ref, () => {
    return {
      controller: controller.current!,
      reloadStage: reloadStage,
    };
  });
  useEffect(() => {
    controller.current?.set_stage_size(stageSize);
  }, [stageSize]);
  useEffect(() => {
    controller.current = new Live2DController(app, stageSize, controllerData);
    //DEBUG
    //window.controller = controller.current;
    //DEBUG/
    if (controller.current.layers.live2d.load_status() === "ready") {
      onModelLoad(LoadStatus.Loading);
      controller.current.layers.live2d.clear();
      controller.current.live2d_load_model(0, onRenderProgress).then(() => {
        onModelLoad(LoadStatus.Loaded);
      });
    }
    return () => {
      controller.current?.destroy();
      controller.current = undefined;
    };
  }, []);
  function reloadStage() {
    controller.current = new Live2DController(app, stageSize, controllerData);
    controller.current.layers.live2d.clear();
    controller.current.live2d_load_model(0);
  }
  return null;
});
StoryReaderLive2DStage.displayName = "StoryReaderLive2DStage";
export default StoryReaderLive2DStage;
