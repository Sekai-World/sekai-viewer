import { PixiComponent } from "@pixi/react";
import { InternalModel, Live2DModel } from "pixi-live2d-display-mulmotion";
import {
  BatchRenderer,
  extensions,
  Extract,
  TickerPlugin,
  Ticker,
} from "pixi.js";
import React, { forwardRef, useEffect, useState } from "react";

interface Live2dModelProps {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
}

extensions.add(TickerPlugin, Extract, BatchRenderer);

const Component = PixiComponent("Live2dModel", {
  create: (props) => {
    const { model } = props;

    return model;
  },
  applyProps: (instance, oldProps, newProps) => {
    const { x, y, scaleX, scaleY } = newProps;

    instance.x = x ?? 0;
    instance.y = y ?? 0;
    instance.scale.set(scaleX ?? 0.1, scaleY ?? 0.1);
  },
});

const Live2dModel = forwardRef<
  Live2DModel<InternalModel>,
  Live2dModelProps & { modelData?: Record<string, any>; onReady?: () => void }
>((props, ref) => {
  const [model, setModel] = useState<Live2DModel<InternalModel>>();
  useEffect(() => {
    let _model: Live2DModel<InternalModel>;
    const func = async () => {
      const modelData = props.modelData;
      if (!modelData) {
        return;
      }
      _model = await Live2DModel.from(modelData, {
        autoFocus: false,
        autoHitTest: false,
        ticker: Ticker.shared,
      });
      setModel(_model);
      if (props.onReady) {
        setTimeout(() => props.onReady!());
      }
    };

    func();
    return () => {
      setModel(undefined);
    };
  }, [props.modelData, props.onReady]);

  return !!model ? <Component {...props} model={model} ref={ref} /> : null;
});
Live2dModel.displayName = "Live2dModel";

export default Live2dModel;
