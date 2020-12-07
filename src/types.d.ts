export type ContentTransModeType = "original" | "translated" | "both";
export type DisplayModeType = "dark" | "light" | "auto";

export interface GachaDetail {
  id: number;
  gachaId: number;
  cardId: number;
  weight: number;
}

export interface GachaBehavior {
  id: number;
  gachaId: number;
  gachaBehaviorType: string;
  costResourceType: string;
  costResourceQuantity: number;
  spinCount: number;
  spinLimit: number;
}

export interface GachaPickup {
  id: number;
  gachaId: number;
  cardId: number;
  gachaPickupType: string;
}

export interface GachaInformation {
  gachaId: number;
  summary: string;
  description: string;
}

export interface IGachaInfo {
  id: number;
  gachaType: string;
  name: string;
  seq: number;
  assetbundleName: string;
  rarity1Rate: number;
  rarity2Rate: number;
  rarity3Rate: number;
  rarity4Rate: number;
  startAt: number;
  endAt: number;
  gachaDetails: GachaDetail[];
  gachaBehaviors: GachaBehavior[];
  gachaPickups: GachaPickup[];
  gachaPickupCostumes: any[];
  gachaInformation: GachaInformation;
}

export interface Cost {
  resourceId: number;
  resourceType: string;
  resourceLevel?: number;
  quantity: number;
}

export interface ICardInfo {
  id: number;
  seq: number;
  characterId: number;
  rarity: number;
  specialTrainingPower1BonusFixed: number;
  specialTrainingPower2BonusFixed: number;
  specialTrainingPower3BonusFixed: number;
  attr: string;
  supportUnit: string;
  skillId: number;
  cardSkillName: string;
  prefix: string;
  assetbundleName: string;
  gachaPhrase: string;
  flavorText: string;
  releaseAt: number;
  cardParameters: {
    id: number;
    cardId: number;
    cardLevel: number;
    cardParameterType: string;
    power: number;
  }[];
  specialTrainingCosts: {
    cardId: number;
    seq: number;
    cost: Cost;
  }[];
  masterLessonAchieveResources: {
    releaseConditionId: number;
    cardId: number;
    masterRank: number;
    resources: {}[];
  }[];
}

export interface IGameChara {
  id: number;
  seq: number;
  resourceId: number;
  firstName: string;
  givenName: string;
  firstNameRuby: string;
  givenNameRuby: string;
  gender: string;
  height: number;
  live2dHeightAdjustment: number;
  figure: string;
  breastSize: string;
  modelName: string;
  unit: string;
  supportUnitType: string;
}

export interface GachaStatistic {
  total: number;
  rarity1: number;
  rarity2: number;
  rarity3: number;
  rarity4: number;
}

export interface IMusicInfo {
  id: number;
  seq: number;
  releaseConditionId: number;
  categories: string[];
  title: string;
  lyricist: string;
  composer: string;
  arranger: string;
  dancerCount: number;
  selfDancerPosition: number;
  assetbundleName: string;
  liveTalkBackgroundAssetbundleName: string;
  publishedAt: number;
  liveStageId: number;
  fillerSec: number;
}

export interface SkillEffectDetail {
  id: number;
  level: number;
  activateEffectDuration: number;
  activateEffectValueType: string;
  activateEffectValue: number;
}

export interface SkillEffect {
  id: number;
  skillEffectType: string;
  activateNotesJudgmentType: string;
  skillEffectDetails: SkillEffectDetail[];
}

export interface ISkillInfo {
  id: number;
  shortDescription: string;
  description: string;
  descriptionSpriteName: string;
  skillEffects: SkillEffect[];
}

export interface ICardRarity {
  rarity: number;
  maxLevel: number;
  maxSkillLevel: number;
  trainingMaxLevel?: number;
}

export interface CharacterRankAchieveResource {
  releaseConditionId: number;
  characterId: number;
  characterRank: number;
  resources: any[];
}

export interface ICharacterRank {
  id: number;
  characterId: number;
  characterRank: number;
  power1BonusRate: number;
  power2BonusRate: number;
  power3BonusRate: number;
  rewardResourceBoxIds: number[];
  characterRankAchieveResources: CharacterRankAchieveResource[];
}

export interface Character {
  id: number;
  musicId: number;
  musicVocalId: number;
  characterType: string;
  characterId: number;
  seq: number;
}

export interface IMusicVocalInfo {
  id: number;
  musicId: number;
  musicVocalType: string;
  seq: number;
  releaseConditionId: number;
  caption: string;
  characters: Character[];
  assetbundleName: string;
}

export interface IOutCharaProfile {
  id: number;
  seq: number;
  name: string;
}

export interface IUserInformationInfo {
  id: number;
  seq: number;
  informationType: string;
  informationTag: string;
  browseType: string;
  platform: string;
  title: string;
  path: string;
  startAt: number;
  endAt: number;
}

export interface IMusicDifficultyInfo {
  id: number;
  musicId: number;
  musicDifficulty: string;
  playLevel: number;
  releaseConditionId: number;
  noteCount: number;
}

export interface IMusicTagInfo {
  id: number;
  musicId: number;
  musicTag: string;
  seq: number;
}

export interface IReleaseCondition {
  id: number;
  sentence: string;
  releaseConditionType: string;
  releaseConditionTypeId?: number;
  releaseConditionTypeLevel?: number;
  releaseConditionTypeQuantity?: number;
}

export interface IMusicDanceMembers {
  id: number;
  musicId: number;
  defaultMusicType: string;
  characterId1: number;
  unit1: string;
  characterId2?: number;
  unit2: string;
  characterId3?: number;
  unit3: string;
  characterId4?: number;
  unit4: string;
  characterId5?: number;
  unit5: string;
}

export interface EventRankingReward {
  id: number;
  eventRankingRewardRangeId: number;
  resourceBoxId: number;
}

export interface EventRankingRewardRange {
  id: number;
  eventId: number;
  fromRank: number;
  toRank: number;
  eventRankingRewards: EventRankingReward[];
}

export interface IEventInfo {
  id: number;
  eventType: string;
  name: string;
  assetbundleName: string;
  bgmAssetbundleName: string;
  startAt: number;
  aggregateAt: number;
  rankingAnnounceAt: number;
  distributionStartAt: number;
  closedAt: number;
  distributionEndAt: number;
  virtualLiveId: number;
  eventRankingRewardRanges: EventRankingRewardRange[];
}

export interface IEventDeckBonus {
  id: number;
  eventId: number;
  gameCharacterUnitId: number;
  cardAttr: string;
  bonusRate: number;
}

export interface IGameCharaUnit {
  id: number;
  gameCharacterId: number;
  unit: string;
  colorCode: string;
  skinColorCode: string;
  skinShadowColorCode1: string;
  skinShadowColorCode2: string;
}

export interface UserCard {
  cardId: number;
  level: number;
  masterRank: number;
  specialTrainingStatus: string;
  defaultImage: string;
}

export interface UserProfile {
  userId: any;
  word: string;
  honorId1?: number;
  honorLevel1?: number;
  honorId2?: number;
  honorLevel2?: number;
  honorId3?: number;
  honorLevel3?: number;
  twitterId: string;
  profileImageType: string;
  userVirtualLiveTop10Rankings: any[];
}

export interface UserRanking {
  userId: any;
  score: number;
  rank: number;
  isOwn: boolean;
  name: string;
  userCard: UserCard;
  userProfile: UserProfile;
}

export interface IEventRealtimeRank {
  time: number;
  first10: UserRanking[];
  rank20: UserRanking[];
  rank30: UserRanking[];
  rank40: UserRanking[];
  rank50: UserRanking[];
  rank100: UserRanking[];
  rank200: UserRanking[];
  rank300: UserRanking[];
  rank400: UserRanking[];
  rank500: UserRanking[];
  rank1000: UserRanking[];
  rank2000: UserRanking[];
  rank3000: UserRanking[];
  rank4000: UserRanking[];
  rank5000: UserRanking[];
  rank10000: UserRanking[];
  rank20000: UserRanking[];
  rank30000: UserRanking[];
  rank40000: UserRanking[];
  rank50000: UserRanking[];
  rank100000: UserRanking[];
}

export interface ResourceBoxDetail {
  resourceBoxPurpose: string;
  resourceBoxId: number;
  seq: number;
  resourceType: string;
  resourceQuantity: number;
  resourceId?: number;
  resourceLevel?: number;
}

export interface IResourceBoxInfo {
  resourceBoxPurpose: string;
  id: number;
  resourceBoxType: string;
  details: ResourceBoxDetail[];
  description: string;
  name: string;
  assetbundleName: string;
}

export interface HonorLevel {
  honorId: number;
  level: number;
  bonus: number;
  description: string;
}

export interface IHonorInfo {
  id: number;
  seq: number;
  groupId: number;
  honorRarity: string;
  name: string;
  assetbundleName: string;
  levels: HonorLevel[];
}

export interface ICardEpisode {
  id: number;
  seq: number;
  cardId: number;
  title: string;
  scenarioId: string;
  assetbundleName: string;
  releaseConditionId: number;
  power1BonusFixed: number;
  power2BonusFixed: number;
  power3BonusFixed: number;
  rewardResourceBoxIds: number[];
  costs: Cost[];
  cardEpisodePartType: string;
}

export interface IStampInfo {
  id: number;
  stampType: string;
  seq: number;
  name: string;
  assetbundleName: string;
  balloonAssetbundleName: string;
  characterId1: number;
}

export interface ITipInfoComic {
  id: number;
  title: string;
  fromUserRank: number;
  toUserRank: number;
  assetbundleName: string;
}

export interface ITipInfoText {
  id: number;
  title: string;
  fromUserRank: number;
  toUserRank: number;
  description: string;
}

export type ITipInfo = ITipInfoText | ITipInfoComic;

export interface ICharaUnitInfo {
  id: number;
  gameCharacterId: number;
  unit: string;
  colorCode: string;
  skinColorCode: string;
  skinShadowColorCode1: string;
  skinShadowColorCode2: string;
}

export interface ICharaProfile {
  characterId: number;
  characterVoice: string;
  birthday: string;
  height: string;
  school: string;
  schoolYear: string;
  hobby: string;
  specialSkill: string;
  favoriteFood: string;
  hatedFood: string;
  weak: string;
  introduction: string;
  scenarioId: string;
}

export interface IUnitProfile {
  unit: string;
  unitName: string;
  seq: number;
  profileSentence: string;
  colorCode: string;
}

export interface ITeamCardState {
  cardId: number;
  level: number;
  skillLevel: number;
}

export interface IMusicMeta {
  music_id: number;
  difficulty: string;
  level: number;
  combo: number;
  music_time: number;
  event_rate: number;
  base_score: number;
  skill_score_solo: number[];
  skill_score_multi: number[];
  fever_score: number;
}

export interface IMusicRecommendResult {
  id: number;
  name: string;
  difficulty: string;
  level: number;
  combo: number;
  result: number;
  link: string;
}

export interface IUnitStoryEpisode {
  id: number;
  unit: string;
  chapterNo: number;
  episodeNo: number;
  unitEpisodeCategory: string;
  episodeNoLabel: string;
  title: string;
  assetbundleName: string;
  scenarioId: string;
  releaseConditionId: number;
  rewardResourceBoxIds: number[];
  andReleaseConditionId?: number;
}

export interface IUnitStoryChapter {
  id: number;
  unit: string;
  chapterNo: number;
  title: string;
  assetbundleName: string;
  episodes: IUnitStoryEpisode[];
}

export interface IUnitStory {
  unit: string;
  seq: number;
  assetbundleName: string;
  chapters: IUnitStoryChapter[];
}

export interface AppearCharacter {
  Character2dId: number;
  CostumeType: string;
}

export enum SnippetAction {
  None = 0,
  Talk = 1,
  CharacerLayout = 2,
  InputName = 3,
  CharacterMotion = 4,
  Selectable = 5,
  SpecialEffect = 6,
  Sound = 7,
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

export interface LayoutData {
  Type: number;
  SideFrom: number;
  SideFromOffsetX: number;
  SideTo: number;
  SideToOffsetX: number;
  DepthType: number;
  Character2dId: number;
  CostumeType: string;
  MotionName: string;
  FacialName: string;
  MoveSpeedType: number;
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

export interface IScenarioData {
  ScenarioId: string;
  AppearCharacters: AppearCharacter[];
  FirstLayout: any[];
  FirstBgm: string;
  FirstBackground: string;
  Snippets: Snippet[];
  TalkData: TalkData[];
  LayoutData: LayoutData[];
  SpecialEffectData: SpecialEffectData[];
  SoundData: SoundData[];
  NeedBundleNames: string[];
  IncludeSoundDataBundleNames: any[];
}

export interface IEpisodeCharacter {
  id: number;
  seq: number;
  character2dId: number;
  storyType: string;
  episodeId: number;
}

export interface ICharacter2D {
  id: number;
  characterType: "game_character" | "mob";
  characterId: number;
  unit: string;
  assetName: string;
}

export interface IMobCharacter {
  id: number;
  seq: number;
  name: string;
  gender: string;
}

export interface EventStoryEpisodeReward {
  resourceBoxId: number;
}

export interface EventStoryEpisode {
  id: number;
  eventStoryId: number;
  episodeNo: number;
  title: string;
  assetbundleName: string;
  scenarioId: string;
  releaseConditionId: number;
  episodeRewards: EventStoryEpisodeReward[];
}

export interface IEventStory {
  id: number;
  eventId: number;
  assetbundleName: string;
  eventStoryEpisodes: EventStoryEpisode[];
}

export interface MissionReward {
  id: number;
  missionType: string;
  missionId: number;
  seq: number;
  resourceBoxId: number;
}

export interface IHonorMission {
  id: number;
  seq: number;
  honorMissionType: string;
  requirement: number;
  sentence: string;
  rewards: MissionReward[];
}
