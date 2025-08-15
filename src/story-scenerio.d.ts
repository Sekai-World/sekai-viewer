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
  /**
   * - 0: No voice, No lip sync
   * - 1: Lip sync with voice
   * - 2: Not lip sync with voice (text in "()", monologue)
   */
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

export interface FirstLayoutData {
  Character2dId: number;
  CostumeType: string;
  MotionName: string;
  FacialName: string;
  /**
   * @see {@link CharacterLayoutMoveSpeedType}
   */
  OffsetX: number;
  /**
   * Define live2d model position.
   * @see {@link CharacterLayoutPosition}
   */
  PositionSide: number;
}

export enum SpecialEffectType {
  None = 0,
  BlackIn = 1,
  BlackOut = 2,
  WhiteIn = 3,
  WhiteOut = 4,
  /**
   * shake background image and live2d
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration shake duration.
   * @param IntVal always 0.
   * @see 07:02 https://www.bilibili.com/video/BV1cb4y1X77p?p=4
   * @see 00:20 https://www.bilibili.com/video/BV1cb4y1X77p?p=6
   * @see 04:24 https://www.bilibili.com/video/BV1r44y1q7im?p=2
   */
  ShakeScreen = 5,
  /**
   * shake dialog
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration shake duration.
   * @param IntVal always 0.
   * @see 01:05 https://www.bilibili.com/video/BV1r44y1q7im?p=7
   */
  ShakeWindow = 6,
  ChangeBackground = 7,
  Telop = 8,
  FlashbackIn = 9,
  FlashbackOut = 10,
  ChangeCardStill = 11,
  /**
   * clear live2d model color shaders
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration shake duration.
   * @param IntVal always 0.
   */
  AmbientColorNormal = 12,
  /**
   * add evening shader to live2d models, yellow-ish
   * @see {@link SpecialEffectType.AmbientColorNormal}
   * @see 01:05 https://www.bilibili.com/video/BV1r44y1q7im?p=7
   */
  AmbientColorEvening = 13,
  /**
   * add evening shader to live2d models, blue-ish
   * @see {@link SpecialEffectType.AmbientColorNormal}
   * @see 04:52 https://www.bilibili.com/video/BV1Bh411a71Q?p=7
   */
  AmbientColorNight = 14,
  /**
   * Add effect to the scenario
   * @param StringVal Effect type: {@link SeScenarioEffectType}
   * @param StringValSub Effect path, equals "scenario/effect/{StringVal}"
   * @param Duration always 0.
   * @param IntVal const 0
   */
  PlayScenarioEffect = 15,
  /**
   * Remove Effect from the scenario
   * @see {@link SpecialEffectType.PlayScenarioEffect}
   */
  StopScenarioEffect = 16,
  ChangeBackgroundStill = 17,
  PlaceInfo = 18,
  Movie = 19,
  /**
   * sekai effect (sekai/white -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 00:18 https://www.bilibili.com/video/BV1cb4y1X77p?p=7
   */
  SekaiIn = 20,
  /**
   * sekai effect (scene -> sekai/white)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 00:18 https://www.bilibili.com/video/BV1cb4y1X77p?p=7
   */
  SekaiOut = 21,
  /**
   * Add shader for a model.
   * @param StringVal Shader type: {@link SeAttachCharacterShaderType}
   * @param StringValSub Shader param, not sure.
   * @param IntVal CharacterId, which model should add this shader.
   */
  AttachCharacterShader = 22,
  SimpleSelectable = 23,
  /**
   * white text on the center of screen.
   * used in unit story.
   * @param StringVal Text
   * @param StringValSub Voice
   * @see https://www.bilibili.com/video/BV1kD4y1R7h9?p=2
   */
  FullScreenText = 24,
  /**
   * @see {@link SpecialEffectType.ShakeScreen}
   */
  StopShakeScreen = 25,
  /**
   * @see {@link SpecialEffectType.ShakeWindow}
   */
  StopShakeWindow = 26,
  /**
   * Add memory filter(yellowish) to the scenario (scene -> memory)
   * @see 03:11 https://www.bilibili.com/video/BV1ya411B71v?p=2
   */
  MemoryIn = 27,
  /**
   * Remove memory filter from the scenario (memory -> scene)
   * @see 03:11 https://www.bilibili.com/video/BV1ya411B71v?p=2
   */
  MemoryOut = 28,
  /**
   * Black wipe in from left to right (black -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 08:54 https://www.bilibili.com/video/BV1y14y1J73B?p=2
   */
  BlackWipeInLeft = 29,
  /**
   * Black wipe out from left to right (scene -> black)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 08:54 https://www.bilibili.com/video/BV1y14y1J73B?p=2
   */
  BlackWipeOutLeft = 30,
  /**
   * Black wipe in from right to left (black -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 08:03 https://www.bilibili.com/video/BV1M142197DZ?p=6
   */
  BlackWipeInRight = 31,
  /**
   * Black wipe out from right to left (scene -> black)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 08:03 https://www.bilibili.com/video/BV1M142197DZ?p=6
   */
  BlackWipeOutRight = 32,
  /**
   * Black wipe in from top to bottom (black -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 10:37 https://www.bilibili.com/video/BV13g411H73v?p=2
   */
  BlackWipeInTop = 33,
  /**
   * Black wipe out from top to bottom (scene -> black)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 10:37 https://www.bilibili.com/video/BV13g411H73v?p=2
   */
  BlackWipeOutTop = 34,
  /**
   * Black wipe in from bottom to top (black -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 03:46 https://www.bilibili.com/video/BV1p4421S7yh?p=5
   */
  BlackWipeInBottom = 35,
  /**
   * Black wipe out from bottom to top (scene -> black)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @param IntVal always 0.
   * @see 03:46 https://www.bilibili.com/video/BV1p4421S7yh?p=5
   */
  BlackWipeOutBottom = 36,
  /**
   * Appear before full screen text. Maybe show black background?
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @see https://www.bilibili.com/video/BV1kD4y1R7h9?p=2
   */
  FullScreenTextShow = 38,
  /**
   * Appear after full screen text. Maybe hide black background?
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration.
   * @see https://www.bilibili.com/video/BV1kD4y1R7h9?p=2
   */
  FullScreenTextHide = 39,
  /**
   * sekai effect from center (sekai/white -> scene)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 00:00 https://www.bilibili.com/video/BV17J4m1e7xw?p=2
   */
  SekaiInCenter = 40,
  /**
   * sekai effect from center (scene -> sekai/white)
   * @param StringVal always empty string.
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 00:00 https://www.bilibili.com/video/BV17J4m1e7xw?p=2
   */
  SekaiOutCenter = 41,
  /**
   * change camera position
   * @param StringVal target camera position in: x, y
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 02:48 https://www.bilibili.com/video/BV1P9SuYaEE6?p=2
   */
  ChangeCameraPosition = 42,
  /**
   * change camera zoom level
   * @param StringVal zoom level
   * @param StringValSub always empty string.
   * @param Duration duration
   * @param IntVal always 0.
   * @see 02:48 https://www.bilibili.com/video/BV1P9SuYaEE6?p=2
   */
  ChangeCameraZoomLevel = 43,
  /**
   * apply blur effect to the backgound
   * @param StringVal true->blur/false->unblur.
   * @param StringValSub always empty string.
   * @param Duration always 0.
   * @param IntVal always 0.
   */
  Blur = 44,
}

export interface SpecialEffectData {
  EffectType: SpecialEffectType;
  StringVal: string;
  StringValSub: string;
  Duration: number;
  IntVal: number;
}

export enum SeAttachCharacterShaderType {
  None = "none",
  Empty = "",
  /**
   * @param StringValSub single value "scenario/effect/hologram"
   */
  Hologram = "hologram",
  Monitor = "monitor",
  /**
   * @param StringValSub single value 1.75, maybe blur radius...?
   */
  Blur = "blur",
}
/**
 * - line: lines shoot out
 *   - line: white lines (06:49 https://www.bilibili.com/video/BV13g411H73v?p=3)
 * - line_legend: lines shoot from below
 *   - line_legend: black lines (06:53 https://www.bilibili.com/video/BV1mC4y1G7rd?p=1)
 *   - line_legend_02(akito,toya,kohane,an): white lines (with character color) (00:26 https://www.bilibili.com/video/BV1mC4y1G7rd?p=3)
 *   - line_legend_03_(a,b)(_white), line_legend_04(_white): unknown
 * - kirakira:
 *   - kirakira_01: (06:18 https://www.bilibili.com/video/BV13g411H73v?p=6)
 *   - kirakira_01_still_an: no circle moving, almost same as kirakira_01 (03:08 https://www.bilibili.com/video/BV1RA4y1d75g?p=4)
 *   - kirakira_02: not circle but octagon, almost same as kirakira_01 (00:15 https://www.bilibili.com/video/BV1RA4y1d75g?p=4)
 *   - kirakira_02_still: no circle moving, almost same as kirakira_02 (04:44 https://www.bilibili.com/video/BV1RA4y1d75g?p=4)
 *   - kirakira_03: sparkle outside to inside (03:37 https://www.bilibili.com/video/BV1RA4y1d75g?p=4)
 *   - kirakira_05, kirakira_06_sanrio_c, kirakira_07_toya, kirakira_08_mrmrhouse: unknown
 * - black_out
 *   - black_out: 30% transparent black layer (04:04 https://www.bilibili.com/video/BV1Vm4y197P8?p=4)
 *   - black_out_02: 20% transparent black layer (01:19 https://www.bilibili.com/video/BV1Yh4y1f7b7?p=1)
 *   - black_out_03: 50% transparent black layer (04:24 https://www.bilibili.com/video/BV1KQ4y1V7y6?p=8)
 *   - black_out_04: 40% transparent black layer (04:54 https://www.bilibili.com/video/BV1jv45e8EAu?p=9)
 * - light_top
 *   - light_up: yellow white light from bottom (05:24 https://www.bilibili.com/video/BV13P4y1V71M?p=7)
 *   - light_up_fireworks_01: same as light_up, but blink like campfire (06:21 https://www.bilibili.com/video/BV1zL4y1A7Q7?p=7)
 *   - light_up_fireworks_02: same as light_up_fireworks_01, but blue (06:08 https://www.bilibili.com/video/BV1Ug41157A7?p=8)
 * - light_up_legend
 *   - light_up_legend_01: fog at bottom (02:04 https://www.bilibili.com/video/BV1mC4y1G7rd?p=7)
 *   - light_up_legend_02: fot at left/right bottom corner (07:18 https://www.bilibili.com/video/BV1mC4y1G7rd?p=3)
 *   - light_up_legend_03: same as light_up_legend_02...? too much effects (02:04 https://www.bilibili.com/video/BV1tb421E7nr?p=7)
 * - dash_line: white lines
 *   - dash_line_(l,r,up,down): lines to the left, right, up, down (05:38 https://www.bilibili.com/video/BV1F14y187VZ?p=2)
 */
export const SeScenarioEffectType = {
  line: ["line"],
  line_legend: [
    "line_legend",
    "line_legend_02",
    "line_legend_02_akito",
    "line_legend_02_toya",
    "line_legend_02_kohane",
    "line_legend_02_an",
    "line_legend_03_a",
    "line_legend_03_a_white",
    "line_legend_03_b",
    "line_legend_04",
    "line_legend_04_white",
  ],
  kirakira: [
    "kirakira_01",
    "kirakira_01_still_an",
    "kirakira_02",
    "kirakira_02_still",
    "kirakira_03",
    "kirakira_05",
    "kirakira_06_sanrio_c",
    "kirakira_07_toya",
    "kirakira_08_mrmrhouse",
  ],
  black_out: ["black_out", "black_out_02", "black_out_03", "black_out_04"],
  light_up: ["light_up", "light_up_fireworks_01", "light_up_fireworks_02"],
  light_up_legend: [
    "light_up_legend_01",
    "light_up_legend_02",
    "light_up_legend_03",
  ],
  dash_line: ["dash_line_down", "dash_line_l", "dash_line_r", "dash_line_up"],
};

export enum SoundPlayMode {
  /**
   * Normal cross fade.
   * @param Bgm bgm name. Either Bgm or Se should be provided, not both.
   * @param Se sound effect name. Either Bgm or Se should be provided, not both.
   * @param Volume always 1.0
   * @param Duration cross fade duration
   * @param SeBundleName always empty string
   */
  CrossFade = 0,
  /**
   * Not sure what to do with this, currently same as CrossFade.
   */
  Stack = 1,
  /**
   * Always used by sound effect, loop.
   * @param Bgm always empty string
   * @param Se sound effect name.
   * @param Volume 0-1
   * @param Duration cross fade duration
   * @param SeBundleName always empty string
   */
  LoopSe = 2,
  /**
   * Stop sound effect.
   * @param Bgm always empty string
   * @param Se sound effect name.
   * @param Volume always 1.0
   * @param Duration cross fade duration
   * @param SeBundleName always empty string
   */
  StopSe = 3,
  /**
   * Set bgm volume.
   * @param Bgm can be empty string or bgm name. If empty string, will set current bgm volume.
   * @param Se always empty string
   * @param Volume 0-1
   * @param Duration cross fade duration
   * @param SeBundleName always empty string
   */
  SetBgmVolume = 4,
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
   * There are usually at most two models coexisting simultaneously,
   * and the models are of normal size.
   * @see https://www.bilibili.com/video/BV13v4y1k7Zr?p=5 12:00 (event_83_05:436)
   */
  Normal = 0,
  /**
   * Three models side by side, the models are slightly small.
   * @see https://www.bilibili.com/video/BV13v4y1k7Zr?p=5 12:00 (event_83_05:425)
   * @see https://www.bilibili.com/video/BV18D4y1K7fN/?p=1 00:00 (001022_ichika01)
   */
  ThreeModels = 3,
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
  FirstLayout: FirstLayoutData[];
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
