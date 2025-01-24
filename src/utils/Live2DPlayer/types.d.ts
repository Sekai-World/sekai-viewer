import type { Howl } from "howler";
import type { IScenarioData, ILive2DModelData } from "../../types";
import type { Animation } from "./animation/BaseAnimation";
import type { Curve, CurveFunction } from "./animation/Curve";
import { Texture, DisplayObject } from "pixi.js";

export enum Live2DAssetType {
  SoundEffect,
  BackgroundMusic,
  Talk,
  UI,
  UISheet,
  UIVideo,
  BackgroundImage,
}

export const Live2DAssetTypeImage = [
  Live2DAssetType.UI,
  Live2DAssetType.UISheet,
  Live2DAssetType.BackgroundImage,
];

export const Live2DAssetTypeSound = [
  Live2DAssetType.SoundEffect,
  Live2DAssetType.BackgroundMusic,
  Live2DAssetType.Talk,
];

export const Live2DAssetTypeUI = [
  Live2DAssetType.UI,
  Live2DAssetType.UISheet,
  Live2DAssetType.UIVideo,
];

export interface ILive2DAssetUrl {
  identifer: string;
  type: Live2DAssetType;
  url: string;
}

export interface ILive2DCachedAsset extends ILive2DAssetUrl {
  data: HTMLImageElement | Howl | null;
}

export interface ILive2DTexture {
  identifer: string;
  texture: Texture;
}
export interface Ilive2DModelInfo {
  cid: number;
  costume: string;
  position: [number, number];
  /**
   * True when model is not T-pose.
   */
  init_pose: boolean;
  /**
   * This param is for show/hide animation.
   * For model visibility, use Live2DModelWithInfo.visible
   */
  hidden: boolean;
  speaking: boolean;
  /**
   * awaitble, resolve when all motion finished.
   */
  wait_motion: Promise<void>;
  animations: Animation[];
}

export interface ILive2DModelDataCollection {
  cid: number;
  costume: string;
  data: ILive2DModelData;
}

export interface ILive2DControllerData {
  scenarioData: IScenarioData;
  scenarioResource: ILive2DCachedAsset[];
  modelData: ILive2DModelDataCollection[];
}

export interface ILive2DLayerData {
  stage_size?: [number, number];
  screen_length?: number;
  textures?: ILive2DTexture[];
  animation_controller?: AnimationController;
}

export type AnimationObj = {
  obj: DisplayObject;
  x?: () => number;
  y?: () => number;
  scale?: () => number;
  scale_x?: () => number;
  scale_y?: () => number;
  angle?: () => number;
  alpha?: () => number;
  x_curve?: Curve;
  y_curve?: Curve;
  scale_curve?: Curve;
  scale_x_curve?: Curve;
  scale_y_curve?: Curve;
  angle_curve?: Curve;
  alpha_curve?: Curve;
  x_func?: CurveFunction;
  y_func?: CurveFunction;
  scale_func?: CurveFunction;
  scale_x_func?: CurveFunction;
  scale_y_func?: CurveFunction;
  angle_func?: CurveFunction;
  alpha_func?: CurveFunction;
};

export interface IProgressEvent {
  (
    type:
      | "media"
      | "model_data"
      | "model_texture"
      | "model_moc"
      | "model_physics"
      | "model_assets"
      | "model_motion",
    count: number,
    total: number,
    info?: string
  );
}

export enum LoadStatus {
  Ready,
  Loading,
  Loaded,
}
