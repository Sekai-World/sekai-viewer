import type { Howl } from "howler";
import type { IScenarioData } from "../../types";
import type { Animation } from "./animation/base";

export enum Live2DAssetType {
  SoundEffect,
  BackgroundMusic,
  Talk,
  UI,
  UISheet,
  BackgroundImage,
}

export const Live2DAssetTypeImage = [
  Live2DAssetType.UI,
  Live2DAssetType.UISheet,
  Live2DAssetType.BackgroundImage,
] as const;

export const Live2DAssetTypeSound = [
  Live2DAssetType.SoundEffect,
  Live2DAssetType.BackgroundMusic,
  Live2DAssetType.Talk,
] as const;

export const Live2DAssetTypeUI = [
  Live2DAssetType.UI,
  Live2DAssetType.UISheet,
] as const;

export interface ILive2DAssetUrl {
  identifer: string;
  type: Live2DAssetType;
  url: string;
}

export interface ILive2DCachedAsset extends ILive2DAssetUrl {
  data: HTMLImageElement | Howl | null;
}

export interface ILive2DModelData {
  Version: number;
  FileReferences: {
    Moc: string;
    Textures: string[];
    Physics: string;
    Motions: {
      Motion: {
        Name: string;
        File: string;
        FadeInTime: number;
        FadeOutTime: number;
      }[];
      Expression: {
        Name: string;
        File: string;
        FadeInTime: number;
        FadeOutTime: number;
      }[];
    };
    Groups: {
      Target: string;
      Name: string;
      Ids: number[];
    }[];
  };
  url: string;
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
  motions: string[];
  expressions: string[];
}

export interface ILive2DControllerData {
  scenarioData: IScenarioData;
  scenarioResource: ILive2DCachedAsset[];
  modelData: ILive2DModelDataCollection[];
}

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
