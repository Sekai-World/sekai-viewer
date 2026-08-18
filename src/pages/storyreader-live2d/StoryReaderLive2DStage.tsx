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
  { readonly controller?: Live2DController; reloadStage: () => void },
  {
    stageSize: [number, number];
    controllerData: ILive2DControllerData;
    onModelLoad: (status: LoadStatus, error?: unknown) => void;
    onRenderProgress: ILive2DLoadProgressHandler;
  }
>(({ stageSize, controllerData, onModelLoad, onRenderProgress }, ref) => {
  const app = useApp();
  const controller = useRef<Live2DController>();
  const disposed = useRef(false);
  useImperativeHandle(ref, () => {
    return {
      get controller() {
        return controller.current;
      },
      reloadStage: reloadStage,
    };
  });
  useEffect(() => {
    controller.current?.set_stage_size(stageSize);
  }, [stageSize]);
  useEffect(() => {
    disposed.current = false;
    const nextController = new Live2DController(app, stageSize, controllerData);
    controller.current = nextController;
    //DEBUG
    //window.controller = controller.current;
    //DEBUG/
    if (nextController.layers.live2d.load_status() === "ready") {
      onModelLoad(LoadStatus.Loading);
      nextController.layers.live2d.clear();
      loadModel(nextController, "Failed to load Live2D model to canvas.");
    }
    return () => {
      disposed.current = true;
      nextController.destroy();
      if (controller.current === nextController) controller.current = undefined;
    };
  }, []);
  function reloadStage() {
    if (disposed.current) return;
    controller.current?.destroy();
    const nextController = new Live2DController(app, stageSize, controllerData);
    controller.current = nextController;
    onModelLoad(LoadStatus.Loading);
    nextController.layers.live2d.clear();
    loadModel(nextController, "Failed to reload Live2D model to canvas.");
  }
  function loadModel(nextController: Live2DController, errorMessage: string) {
    nextController
      .live2d_load_model(0, onRenderProgress)
      .then(() => {
        if (!disposed.current && controller.current === nextController) {
          onModelLoad(LoadStatus.Loaded);
        }
      })
      .catch((error: unknown) => {
        console.error(errorMessage, error);
        if (!disposed.current && controller.current === nextController) {
          onModelLoad(LoadStatus.Ready, error);
        }
      });
  }
  return null;
});
StoryReaderLive2DStage.displayName = "StoryReaderLive2DStage";
export default StoryReaderLive2DStage;
