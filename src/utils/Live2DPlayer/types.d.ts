import type { Howl } from "howler";
import type { IScenarioData } from "../../types";

export enum Live2DSoundAssetType {
  SoundEffect = "soundeffect",
  BackgroundMusic = "backgroundmusic",
  Talk = "talk",
}

export enum Live2DImageAssetType {
  BackgroundImage = "backgroundimage",
  UI = "ui",
}

export interface ILive2DAssetUrl {
  identifer: string;
  type: Live2DSoundAssetType | Live2DImageAssetType;
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
  scenarioResource: ILive2DCachedData[];
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
