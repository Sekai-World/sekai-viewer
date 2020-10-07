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

export interface GahcaRootObject {
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
    cost: {
      resourceId: number;
      resourceType: string;
      resourceLevel: number;
      quantity: number;
    };
  }[];
  masterLessonAchieveResources: {
    releaseConditionId: number;
    cardId: number;
    masterRank: number;
    resources: {}[];
  }[];
}

export interface ICharaProfile {
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
