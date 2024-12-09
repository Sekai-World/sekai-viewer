import { Howl } from "howler";
import { IScenarioData } from "../../types";

// TODO:
// sounds url not parse properly.
// NOT IMPLEMENT YET:
//  - SnippetAction.CharacterLayoutMode <- not sure what this means
//  - SnippetAction.Sound
//      - SoundData.Volume
//      - SoundData.SoundPlayMode
//  - SnippetAction.InputName
//  - SnippetAction.Selectable
//  - SnippetAction.CharacerLayout <- typo in types.d
//     - character moving
//  - SnippetAction.SpecialEffect
//     - SpecialEffectType.ShakeScreen
//     - SpecialEffectType.ShakeWindow
//     - SpecialEffectType.ChangeCardStill
//     - SpecialEffectType.AmbientColorNormal
//     - SpecialEffectType.AmbientColorEvening
//     - SpecialEffectType.AmbientColorNight
//     - SpecialEffectType.PlayScenarioEffect
//     - SpecialEffectType.StopScenarioEffect
//     - SpecialEffectType.ChangeBackgroundStill
//     - SpecialEffectType.PlaceInfo
//     - SpecialEffectType.Movie
//     - SpecialEffectType.SekaiIn
//     - SpecialEffectType.SekaiOut
//     - SpecialEffectType.AttachCharacterShader
//     - SpecialEffectType.SimpleSelectable
//     - SpecialEffectType.FullScreenText
//     - SpecialEffectType.StopShakeScreen
//     - SpecialEffectType.StopShakeWindow
// bgm fade in and out
// expression conflict with motion
// VoiceId more than one
// lipsync

export interface ILive2DDataUrls {
  identifer: string;
  type: "soundeffect" | "backgroundmusic" | "talk" | "background";
  url: string;
}

export interface ILive2DCachedData extends ILive2DDataUrls {
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
  position: number[];
  init_pose: boolean;
  hidden: boolean;
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

// CostumeType only appear in the first time
export enum CharacterLayoutType {
  Move = 1, //SideFrom 0 SideTo 4
  Appear = 2, // model first appear ? or only change motion???
  Clear = 3, // clear live2d, if no any live2d to clear, then clear dialog(001017_ichika01)
}

export enum CharacterMotionType {
  Change = 0,
}

export enum LoadStatus {
  Ready,
  Loading,
  Loaded,
}
