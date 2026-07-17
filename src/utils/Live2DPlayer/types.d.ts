import type { Howl } from "howler";
import type { IScenarioData, ILive2DModelData } from "../../types";
import type { Animation } from "./animation/BaseAnimation";
import type { Curve, CurveFunction } from "./animation/Curve";
import { Texture, DisplayObject } from "pixi.js";

export enum Live2DAssetType {
  SoundEffect = "sound-effect",
  BackgroundMusic = "bgm",
  Talk = "talk",
  UI = "ui",
  UISheet = "ui-sheet",
  UIVideo = "ui-video",
  BackgroundImage = "background-image",
  Video = "video",
}

interface ILive2DAssetTypeToDataMap {
  [Live2DAssetType.SoundEffect]: Howl;
  [Live2DAssetType.BackgroundMusic]: Howl;
  [Live2DAssetType.Talk]: Howl;
  [Live2DAssetType.UI]: HTMLImageElement;
  [Live2DAssetType.UISheet]: HTMLImageElement;
  [Live2DAssetType.BackgroundImage]: HTMLImageElement;
  [Live2DAssetType.Video]: HTMLVideoElement;
  [Live2DAssetType.UIVideo]: HTMLVideoElement;
}

export interface ILive2DAssetBase {
  identifier: string;
  url: string;
}

export type ILive2DAssetUrl = {
  [K in keyof ILive2DAssetTypeToDataMap]: ILive2DAssetBase & {
    type: K;
    data?: ILive2DAssetTypeToDataMap[K];
  };
}[keyof ILive2DAssetTypeToDataMap];

// type category
type ILive2DAssetUrlImage = Extract<
  ILive2DAssetUrl,
  {
    type:
      | Live2DAssetType.BackgroundImage
      | Live2DAssetType.UISheet
      | Live2DAssetType.UI;
  }
>;
type ILive2DAssetUrlVideo = Extract<
  ILive2DAssetUrl,
  {
    type: Live2DAssetType.Video | Live2DAssetType.UIVideo;
  }
>;
type ILive2DAssetUrlAudio = Extract<
  ILive2DAssetUrl,
  {
    type:
      | Live2DAssetType.SoundEffect
      | Live2DAssetType.BackgroundMusic
      | Live2DAssetType.Talk;
  }
>;
export function isLive2DImageAsset(
  asset: ILive2DAssetUrl
): asset is ILive2DAssetUrlImage {
  return (
    asset.type === Live2DAssetType.BackgroundImage ||
    asset.type === Live2DAssetType.UISheet ||
    asset.type === Live2DAssetType.UI
  );
}
export function isLive2DVideoAsset(
  asset: ILive2DAssetUrl
): asset is ILive2DAssetUrlVideo {
  return (
    asset.type === Live2DAssetType.Video ||
    asset.type === Live2DAssetType.UIVideo
  );
}
export function isLive2DAudioAsset(
  asset: ILive2DAssetUrl
): asset is ILive2DAssetUrlAudio {
  return (
    asset.type === Live2DAssetType.SoundEffect ||
    asset.type === Live2DAssetType.BackgroundMusic ||
    asset.type === Live2DAssetType.Talk
  );
}
export type ILive2DCachedAsset = Required<ILive2DAssetUrl>;

export type ILive2DScenarioResource = {
  image: Required<ILive2DAssetUrlImage>[];
  video: Required<ILive2DAssetUrlVideo>[];
  audio: Required<ILive2DAssetUrlAudio>[];
};

export interface ILive2DTexture {
  identifier: string;
  texture: Texture;
}
export interface Ilive2DModelInfo {
  cid: number;
  costume: string;
  position: [number, number];
  /**
   * True when model is T-pose.
   */
  t_pose: boolean;
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
  scenarioResource: ILive2DScenarioResource;
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

export enum Live2DLoadProgressType {
  Media = "media",
  ModelData = "model-data",
  ModelTexture = "model-texture",
  ModelMoc = "model-moc",
  ModelPhysics = "model-physics",
  ModelAssets = "model-assets",
  ModelMotion = "model-motion",
  RenderModel = "render-model",
}

export interface ILive2DLoadProgressHandler {
  (
    type: Live2DLoadProgressType,
    count: number,
    total: number,
    info?: string
  ): void;
}

export interface ILive2DLoadWarningHandler {
  (reason: string): void;
}

export interface ILive2DPlayerSettings {
  voiceVolume: number;
  seVolume: number;
  bgmVolume: number;
  autoplay: boolean;
  textAnimation: boolean;
  showWarning: boolean;
  showUI: boolean;
}

export enum LoadStatus {
  Ready,
  Loading,
  Loaded,
}
