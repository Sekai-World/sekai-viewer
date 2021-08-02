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
  gachaCeilItemId: number;
  gachaDetails: GachaDetail[];
  gachaBehaviors: GachaBehavior[];
  gachaPickups: GachaPickup[];
  gachaPickupCostumes: never[];
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

export interface IMusicAchievement {
  id: number;
  musicAchievementType: string;
  musicAchievementTypeValue: string;
  resourceBoxId: number;
  musicDifficultyType: string;
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

export type EventType = "marathon" | "cheerful_carnival" | "challenge_live";

export interface IEventInfo {
  id: number;
  eventType: EventType;
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
  trained: boolean;
  // power: number;
  masterRank: number;
  story1Unlock: boolean;
  story2Unlock: boolean;
}

export interface ITeamBuild {
  id?: number;
  teamCards: number[];
  teamCardsStates: ITeamCardState[];
  teamTotalPower: number;
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
  mid: number;
  name: string;
  difficulty: string;
  level: number;
  combo: number;
  result: number | number[];
  link: string;
}

export interface IEventCalcAllSongsResult {
  id: number;
  mid: number;
  name: string;
  difficulty: string;
  level: number;
  result: number;
  resultPerHour: number;
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

export interface INormalMission {
  id: number;
  seq: number;
  normalMissionType: string;
  requirement: number;
  sentence: string;
  rewards: MissionReward[];
}

export interface IBeginnerMission {
  id: number;
  seq: number;
  beginnerMissionType: string;
  beginnerMissionCategory: string;
  requirement: number;
  sentence: string;
  rewards: MissionReward[];
}

export interface IHonorGroup {
  id: number;
  honorType: string;
  name: string;
  backgroundAssetbundleName?: string;
}

export enum CharacterMissionType {
  PLAY_LIVE = "play_live",
  // COLLECT_CARD = "collect_card",
  WAITING_ROOM = "waiting_room",
  COLLECT_COSTUME_3D = "collect_costume_3d",
  // LIVE_CLEAR = "live_clear",
  COLLECT_STAMP = "collect_stamp",
  READ_AREA_TALK = "read_area_talk",
  // SKILL_EXP = "skill_exp",
  SKILL_LEVEL_UP = "skill_level_up",
  MASTER_RANK = "master_rank",
  // READ_EPISODE = "read_episode",
  READ_CARD_EPISODE_FIRST = "read_card_episode_first",
  READ_CARD_EPISODE_SECOND = "read_card_episode_second",
}

export interface ICharacterMission {
  id: number;
  seq: number;
  characterId: number;
  characterMissionType: CharacterMissionType;
  requirement: number;
  sentence: string;
}

export interface UserGamedata {
  userId: number;
  name: string;
  deck: number;
  rank: number;
}

export interface User {
  userGamedata: UserGamedata;
}

export interface UserProfile {
  userId: number;
  word: string;
  honorId1: number;
  honorLevel1: number;
  honorId2: number;
  honorLevel2: number;
  honorId3: number;
  honorLevel3: number;
  twitterId: string;
  profileImageType: string;
}

export interface UserDeck {
  leader: number;
  member1: number;
  member2: number;
  member3: number;
  member4: number;
  member5: number;
}

export interface UserCardEpisode {
  cardEpisodeId: number;
  scenarioStatus: string;
  scenarioStatusReasons: string[];
  isNotSkipped: boolean;
}

export interface UserCard {
  cardId: number;
  level: number;
  masterRank: number;
  specialTrainingStatus: string;
  defaultImage: string;
  episodes: UserCardEpisode[];
}

export interface UserMusicResult {
  userId: number;
  musicId: number;
  musicDifficulty: string;
  playType: string;
  playResult: string;
  highScore: number;
  fullComboFlg: boolean;
  fullPerfectFlg: boolean;
  mvpCount: number;
  superStarCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserMusicDifficultyStatus {
  musicId: number;
  musicDifficulty: string;
  musicDifficultyStatus: string;
  userMusicResults: UserMusicResult[];
}

export interface UserMusic {
  userId: number;
  musicId: number;
  userMusicDifficultyStatuses: UserMusicDifficultyStatus[];
}

export interface UserCharacter {
  characterId: number;
  characterRank: number;
}

export interface UserChallengeLiveSoloResult {
  characterId: number;
  highScore: number;
}

export interface UserChallengeLiveSoloStage {
  challengeLiveStageType: string;
  characterId: number;
  challengeLiveStageId: number;
  rank: number;
}

export interface UserAreaItem {
  areaItemId: number;
  level: number;
}

export interface UserHonor {
  userId: number;
  honorId: number;
  level: number;
  obtainedAt: number;
}

export interface IUserProfile {
  user: User;
  userProfile: UserProfile;
  userDecks: UserDeck[];
  userCards: UserCard[];
  userMusics: UserMusic[];
  userCharacters: UserCharacter[];
  userChallengeLiveSoloResults: UserChallengeLiveSoloResult[];
  userChallengeLiveSoloStages: UserChallengeLiveSoloStage[];
  userAreaItems: UserAreaItem[];
  userHonors: UserHonor[];
}

export type EventGraphRanking =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 20
  | 30
  | 40
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 1000
  | 2000
  | 3000
  | 4000
  | 5000
  | 10000
  | 20000
  | 30000
  | 40000
  | 50000
  | 100000;
export interface EventRankingResponse {
  id: number;
  eventId: number;
  timestamp: string;
  rank: number;
  score: number;
  userId: string;
  userName: string;
  userCard?: UserCard;
  userProfile?: UserProfile;
}

export interface IEventCard {
  id: number;
  cardId: number;
  eventId: number;
}

export interface IGachaCeilItem {
  id: number;
  gachaId: number;
  name: string;
  assetbundleName: string;
  convertStartAt: number;
  convertResourceBoxId: number;
}

export interface VirtualLiveSetlist {
  id: number;
  virtualLiveId: number;
  seq: number;
  virtualLiveSetlistType: string;
  assetbundleName: string;
  virtualLiveStageId: number;
  musicId?: number;
  musicVocalId?: number;
  character3dId1?: number;
  character3dId2?: number;
  character3dId3?: number;
  character3dId4?: number;
  character3dId5?: number;
}

export interface VirtualLiveBeginnerSchedule {
  id: number;
  virtualLiveId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface VirtualLiveSchedule {
  id: number;
  virtualLiveId: number;
  seq: number;
  startAt: any;
  endAt: any;
}

export interface VirtualLiveCharacter {
  id: number;
  virtualLiveId: number;
  gameCharacterUnitId: number;
  seq: number;
}

export interface VirtualLiveReward {
  id: number;
  virtualLiveType: string;
  virtualLiveId: number;
  resourceBoxId: number;
}

export interface VirtualLiveReward2 {
  id: number;
  virtualLiveType: string;
  virtualLiveId: number;
  resourceBoxId: number;
}

export interface VirtualLiveWaitingRoom {
  id: number;
  virtualLiveId: number;
  assetbundleName: string;
  startAt: any;
  endAt: any;
}

export interface VirtualItem {
  id: number;
  virtualItemCategory: string;
  seq: number;
  priority: number;
  name: string;
  assetbundleName: string;
  costVirtualCoin: number;
  costJewel: number;
  cheerPoint: number;
  effectAssetbundleName: string;
  effectExpressionType: string;
  virtualItemLabelType: string;
}

export interface IVirtualLiveInfo {
  id: number;
  virtualLiveType: string;
  virtualLivePlatform: string;
  seq: number;
  name: string;
  assetbundleName: string;
  screenMvMusicVocalId: number;
  startAt: any;
  endAt: any;
  rankingAnnounceAt: any;
  virtualLiveSetlists: VirtualLiveSetlist[];
  virtualLiveBeginnerSchedules: VirtualLiveBeginnerSchedule[];
  virtualLiveSchedules: VirtualLiveSchedule[];
  virtualLiveCharacters: VirtualLiveCharacter[];
  virtualLiveReward: VirtualLiveReward;
  virtualLiveRewards: VirtualLiveReward2[];
  virtualLiveCheerPointRewards: any[];
  virtualLiveWaitingRoom: VirtualLiveWaitingRoom;
  virtualItems: VirtualItem[];
  archiveReleaseConditionId?: number;
}

export interface MasterOfCermonyBaseEvent {
  Id: int;
  Time: float;
  Duration: float;
  Character3dId: int;
  FaicialKey: string;
  MotionKey: string;
}

export interface CharacterSpawnEvent extends MasterOfCermonyBaseEvent {
  HeadCostume3dId: number;
  BodyCostume3dId: number;
}

export interface CharacterUnspawnEvent extends MasterOfCermonyBaseEvent {}

export interface CharacterTalkEvent extends MasterOfCermonyBaseEvent {
  Serif: string;
  VoiceKey: string;
}

export interface IMasterOfCermonyData {
  Id: string;
  characterSpawnEvents: CharacterSpawnEvent[];
  characterUnspawnEvents: CharacterUnspawnEvent[];
  // characterMoveEvents: CharacterMoveEvent[];
  // characterRotateEvents: CharacterRotateEvent[];
  // characterMotionEvents: CharacterMotionEvent[];
  characterTalkEvents: CharacterTalkEvent[];
  // characterIntaractionEvents: any[];
  // effectMCEvents: any[];
  // lightEvents: LightEvent[];
  soundEvents: SoundEvent[];
  // bgmEvents: any[];
  // audienceEvents: AudienceEvent[];
  // stageObjectSpawnEvents: any[];
  // globalSpotlightEvents: GlobalSpotlightEvent[];
  // aisacEvents: AisacEvent[];
  // screenFadeEvents: any[];
}

export interface ICharacter3D {
  id: number;
  characterType: string;
  characterId: number;
  unit: string;
  name: string;
  headCostume3dId: number;
  bodyCostume3dId: number;
}

export interface ICostume3DModel {
  id: number;
  costume3dId: number;
  unit: string;
  assetbundleName: string;
  thumbnailAssetbundleName: string;
}

export interface IAreaItemLevel {
  areaItemId: number;
  level: number;
  targetUnit: string;
  targetCardAttr: string;
  targetGameCharacterId: number;
  power1BonusRate: number;
  power1AllMatchBonusRate: number;
  power2BonusRate: number;
  power2AllMatchBonusRate: number;
  power3BonusRate: number;
  power3AllMatchBonusRate: number;
  sentence: string;
}

export interface IAreaItem {
  id: number;
  areaId: number;
  name: string;
  flavorText: string;
  spawnPoint: string;
  assetbundleName: string;
}

export interface EventPrediction {
  data: {
    ts: number;
    "100": number;
    "200": number;
    "500": number;
    "1000": number;
    "2000": number;
    "5000": number;
    "10000": number;
    "20000": number;
    "50000": number;
    "100000": number;
  };
}

export interface ICheerfulCarnivalSummary {
  id: number;
  eventId: number;
  theme: string;
  midtermAnnounce1At: number;
  midtermAnnounce2At: number;
  assetbundleName: string;
}

export interface ICheerfulCarnivalTeam {
  id: number;
  eventId: number;
  seq: number;
  teamName: string;
  assetbundleName: string;
}

export interface IArea {
  id: number;
  assetbundleName: string;
  areaType: string;
  viewType: string;
  name: string;
  releaseConditionId: number;
}

export interface IActionSet {
  id: number;
  areaId: number;
  scriptId: string;
  characterIds: number[];
  scenarioId: string;
  actionSetType: string;
}
