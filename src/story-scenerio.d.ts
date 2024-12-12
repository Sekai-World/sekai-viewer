export interface AppearCharacter {
  Character2dId: number;
  CostumeType: string;
}

export enum SnippetAction {
  None = 0,
  Talk = 1,
  /**
   * Change live2d model motion/visibility/position.
   * @see {@link CharacterLayoutType}
   */
  CharacterLayout = 2,
  InputName = 3,
  /**
   * Change live2d model motion.
   * @see {@link CharacterLayoutType}
   */
  CharacterMotion = 4,
  Selectable = 5,
  SpecialEffect = 6,
  Sound = 7,
  /**
   * Control model display mode
   * @see {@link CharacterLayoutMode}
   */
  CharacterLayoutMode = 8,
}

export enum SnippetProgressBehavior {
  Now = 0,
  WaitUnitilFinished = 1,
}

export interface Snippet {
  Action: SnippetAction;
  ProgressBehavior: SnippetProgressBehavior;
  ReferenceIndex: number;
  Delay: number;
}

export interface TalkCharacter {
  Character2dId: number;
}

export interface Motion {
  Character2dId: number;
  MotionName: string;
  FacialName: string;
  TimingSyncValue: number;
}

export interface Voice {
  Character2dId: number;
  VoiceId: string;
  Volume: number;
}

export interface TalkData {
  TalkCharacters: TalkCharacter[];
  WindowDisplayName: string;
  Body: string;
  TalkTention: number;
  LipSync: number;
  MotionChangeFrom: number;
  Motions: Motion[];
  Voices: Voice[];
  Speed: number;
  FontSize: number;
  WhenFinishCloseWindow: number;
  RequirePlayEffect: number;
  EffectReferenceIdx: number;
  RequirePlaySound: number;
  SoundReferenceIdx: number;
}

export enum CharacterLayoutType {
  /**
   * Apply motion or expression only.
   * SideFrom/SideTo always the same in this type.
   * Only appear in CharacterMotion action.
   * - Step 1: Apply motions and expressions.
   */
  CharacterMotion = 0,
  /**
   * Apply motion or expression with position change.
   * SideFrom always equals 0 in this type.
   * Move model from current position to SideTo.
   * - Step 1: Apply motions and expressions.
   * - (Same time) Move from current position to SideTo position or not move.
   */
  Motion = 1,
  /**
   * Model appear in the scene, apply motion with position change.
   * - Step 1: Apply motions and expressions. (To get the finish pose.)
   * - Step 2: Show. (after motion finished)
   * - (Same time) Set appear time. (For calculate how long the model exist.)
   * - (Same time) Move from SideFrom position to SideTo position or at SideFrom position.
   * - (Same time) Apply the same motions and expressions again.
   */
  Appear = 2,
  /**
   * Model disappear in the scene, apply motion with position change.
   * - Step 1: Move from SideFrom position to SideTo position or not move.
   * - Step 2: Wait for the model exist at least 2 seconds.
   * - Step 3: Hide.
   */
  Clear = 3,
  /**
   * Not sure what this for.
   * Currently ignore.
   * @see https://www.bilibili.com/video/BV12S421X7ns?p=6 05:03 (wl_piapro_01_06:202)
   * @see https://www.bilibili.com/video/BV13v4y1k7Zr?p=5 12:00 (event_83_05:450)
   */
  ChangeDepth = 6,
}

export enum CharacterLayoutPosition {
  /**
   * Ignore.
   */
  Unspecified = 0,
  /**
   * Out of the screen from left center.
   * @see https://www.bilibili.com/video/BV12S421X7ns?p=11 p11 05:38 (wl_piapro_01_11:220)
   */
  LeftEdge = 2,
  /**
   * At the left of the screen.
   * About 30% of the screen width.
   */
  Left = 3,
  /**
   * At the center of the screen.
   */
  Center = 4,
  /**
   * Out of the screen from right center.
   * @see https://www.bilibili.com/video/BV12S421X7ns?p=11 p11 05:38 (wl_piapro_01_11:213)
   */
  RightEdge = 6,
  /**
   * At the right of the screen.
   * About 70% of the screen width.
   */
  Right = 7,
  /**
   * Out of the screen from bottom left.
   * Directly under CharacterLayoutPosition.Left
   * @see https://www.bilibili.com/video/BV1r94y1z7HN?p=8 p8 01:35 (event_104_08:96)
   * @see https://www.bilibili.com/video/BV1d8411i7eN?p=6 p6 09:22 (event_106_06:410)
   */
  BottomLeftEdge = 9,
  /**
   * Out of the screen from bottom center.
   * Directly under CharacterLayoutPosition.Center
   * @see https://www.bilibili.com/video/BV12S421X7ns?p=11 p11 05:38 (wl_piapro_01_11:210)
   */
  BottomEdge = 10,
  /**
   * Out of the screen from bottom right.
   * Directly under CharacterLayoutPosition.Right
   * @see https://www.bilibili.com/video/BV1r94y1z7HN?p=8 p8 01:35 (event_104_08:97)
   */
  BottomRightEdge = 12,
}

export enum CharacterLayoutDepthType {
  Top = 0,
  MidTop = 1,
  MidBack = 2,
  Back = 3,
}

export enum CharacterLayoutMoveSpeedType {
  /**
   * @see https://www.bilibili.com/video/BV1CQ4y1S7ge?p=2 05:55 (event_39_02:223)
   */
  Slow = 0,
  Normal = 1,
  /**
   * @see https://www.bilibili.com/video/BV1Yq4y1d7es?p=1 01:33 (event_37_01:61)
   */
  Fast = 2,
}

export interface LayoutData {
  /**
   * Define how to change live2d model.
   * @see {@link CharacterLayoutType}
   */
  Type: CharacterLayoutType;
  /**
   * Define live2d model position.
   * @see {@link CharacterLayoutPosition}
   */
  SideFrom: CharacterLayoutPosition;
  /**
   * @see https://www.bilibili.com/video/BV1CQ4y1S7ge?p=2 05:55 (event_39_02:223)
   */
  SideFromOffsetX: number;
  /**
   * Define live2d model position.
   * @see {@link CharacterLayoutPosition}
   */
  SideTo: CharacterLayoutPosition;
  /**
   * @see https://www.bilibili.com/video/BV1CQ4y1S7ge?p=2 05:55 (event_39_02:223)
   */
  SideToOffsetX: number;
  DepthType: CharacterLayoutDepthType;
  Character2dId: number;
  CostumeType: string;
  MotionName: string;
  FacialName: string;
  /**
   * @see {@link CharacterLayoutMoveSpeedType}
   */
  MoveSpeedType: CharacterLayoutMoveSpeedType;
}

export enum SpecialEffectType {
  None = 0,
  BlackIn = 1,
  BlackOut = 2,
  WhiteIn = 3,
  WhiteOut = 4,
  ShakeScreen = 5,
  ShakeWindow = 6,
  ChangeBackground = 7,
  Telop = 8,
  FlashbackIn = 9,
  FlashbackOut = 10,
  ChangeCardStill = 11,
  AmbientColorNormal = 12,
  AmbientColorEvening = 13,
  AmbientColorNight = 14,
  PlayScenarioEffect = 15,
  StopScenarioEffect = 16,
  ChangeBackgroundStill = 17,
  PlaceInfo = 18,
  Movie = 19,
  SekaiIn = 20,
  SekaiOut = 21,
  AttachCharacterShader = 22,
  SimpleSelectable = 23,
  FullScreenText = 24,
  StopShakeScreen = 25,
  StopShakeWindow = 26,
}

export interface SpecialEffectData {
  EffectType: SpecialEffectType;
  StringVal: string;
  StringValSub: string;
  Duration: number;
  IntVal: number;
}

export enum SoundPlayMode {
  CrossFade = 0,
  Stack = 1,
  SpecialSePlay = 2,
  Stop = 3,
}

export interface SoundData {
  PlayMode: SoundPlayMode;
  Bgm: string;
  Se: string;
  Volume: number;
  SeBundleName: string;
  Duration: number;
}

export enum CharacterLayoutMode {
  /**
   * Appear one by one.
   * @see https://www.bilibili.com/video/BV13v4y1k7Zr?p=5 12:00 (event_83_05:436)
   */
  Sequential = 0,
  /**
   * Appear in the sametime.
   * @see https://www.bilibili.com/video/BV13v4y1k7Zr?p=5 12:00 (event_83_05:425)
   */
  Simultaneous = 3,
}

export interface ScenarioSnippetCharacterLayoutMode {
  /**
   * @see {@link CharacterLayoutMode}
   */
  CharacterLayoutMode: CharacterLayoutMode;
}

export interface IScenarioData {
  ScenarioId: string;
  AppearCharacters: AppearCharacter[];
  FirstLayout: LayoutData[];
  FirstBgm: string;
  FirstBackground: string;
  FirstCharacterLayoutMode: CharacterLayoutMode;
  Snippets: Snippet[];
  TalkData: TalkData[];
  LayoutData: LayoutData[];
  SpecialEffectData: SpecialEffectData[];
  SoundData: SoundData[];
  NeedBundleNames: string[];
  IncludeSoundDataBundleNames: string[];
  ScenarioSnippetCharacterLayoutModes: ScenarioSnippetCharacterLayoutMode[];
}
