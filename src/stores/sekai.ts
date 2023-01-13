import axios from "axios";
import { types, Instance, flow } from "mobx-state-tree";
import { ServerRegion } from "../types";

export const SekaiUserGamedata = types.model({
  deck: types.number,
  name: types.string,
  rank: types.number,
  userId: types.number,
});
export interface ISekaiUserGamedata
  extends Instance<typeof SekaiUserGamedata> {}

export const SekaiUser = types.model({
  userGamedata: SekaiUserGamedata,
});
export interface ISekaiUser extends Instance<typeof SekaiUser> {}

export const SekaiUserProfile = types.model({
  honorId1: types.maybe(types.number),
  honorId2: types.maybe(types.number),
  honorId3: types.maybe(types.number),
  honorLevel1: types.maybe(types.number),
  honorLevel2: types.maybe(types.number),
  honorLevel3: types.maybe(types.number),
  profileImageType: types.string,
  twitterId: types.optional(types.string, ""),
  userId: types.number,
  word: types.string,
});
export interface ISekaiUserProfile extends Instance<typeof SekaiUserProfile> {}

export const SekaiUserDeck = types.model({
  leader: types.number,
  member1: types.number,
  member2: types.number,
  member3: types.number,
  member4: types.number,
  member5: types.number,
  subLeader: types.maybe(types.number),
});
export interface ISekaiUserDeck extends Instance<typeof SekaiUserDeck> {}

export const SekaiUserCardEpisode = types.model({
  cardEpisodeId: types.number,
  isNotSkipped: types.boolean,
  scenarioStatus: types.string,
  scenarioStatusReasons: types.maybe(types.array(types.string)),
});
export interface ISekaiUserCardEpisode
  extends Instance<typeof SekaiUserCardEpisode> {}

export const SekaiUserCard = types.model({
  cardId: types.number,
  defaultImage: types.string,
  episodes: types.array(SekaiUserCardEpisode),
  level: types.number,
  masterRank: types.number,
  specialTrainingStatus: types.string,
});
export interface ISekaiUserCard extends Instance<typeof SekaiUserCard> {}

export const SekaiUserMusicResult = types.model({
  createdAt: types.maybe(types.number),
  fullComboFlg: types.boolean,
  fullPerfectFlg: types.boolean,
  highScore: types.number,
  musicDifficulty: types.string,
  musicId: types.maybe(types.number),
  mvpCount: types.number,
  playResult: types.string,
  playType: types.string,
  superStarCount: types.number,
  updatedAt: types.maybe(types.number),
  userId: types.maybe(types.number),
});
export interface ISekaiUserMusicResult
  extends Instance<typeof SekaiUserMusicResult> {}

export const SekaiUserMusicDifficultyStatus = types.model({
  musicDifficulty: types.string,
  musicDifficultyStatus: types.string,
  musicId: types.maybe(types.number),
  userMusicResults: types.array(SekaiUserMusicResult),
});
export interface ISekaiUserMusicDifficultyStatus
  extends Instance<typeof SekaiUserMusicDifficultyStatus> {}

export const SekaiUserMusic = types.model({
  musicId: types.number,
  userId: types.maybe(types.number),
  userMusicDifficultyStatuses: types.array(SekaiUserMusicDifficultyStatus),
});
export interface ISekaiUserMusic extends Instance<typeof SekaiUserMusic> {}

export const SekaiUserCharacter = types.model({
  characterId: types.number,
  characterRank: types.number,
});
export interface ISekaiUserCharacter
  extends Instance<typeof SekaiUserCharacter> {}

export const SekaiUserChallengeLiveSoloResult = types.model({
  characterId: types.number,
  highScore: types.number,
});
export interface ISekaiUserChallengeLiveSoloResult
  extends Instance<typeof SekaiUserChallengeLiveSoloResult> {}

export const SekaiUserChallengeLiveSoloStage = types.model({
  challengeLiveStageId: types.number,
  challengeLiveStageType: types.string,
  characterId: types.number,
  rank: types.number,
});
export interface ISekaiUserChallengeLiveSoloStage
  extends Instance<typeof SekaiUserChallengeLiveSoloStage> {}

export const SekaiUserAreaItem = types.model({
  areaItemId: types.number,
  level: types.number,
});
export interface ISekaiUserAreaItem
  extends Instance<typeof SekaiUserAreaItem> {}

export const SekaiUserHonor = types.model({
  honorId: types.number,
  level: types.number,
  obtainedAt: types.number,
  userId: types.maybe(types.number),
});
export interface ISekaiUserHonor extends Instance<typeof SekaiUserHonor> {}

export const SekaiUserBondsHonor = types.model({
  bondsHonorId: types.number,
  level: types.number,
  obtainedAt: types.number,
});
export interface ISekaiUserBondsHonor
  extends Instance<typeof SekaiUserBondsHonor> {}

export const SekaiUserProfileHonor = types.model({
  bondsHonorViewType: types.maybe(types.string),
  bondsHonorWordId: types.maybe(types.number),
  honorId: types.number,
  honorLevel: types.number,
  profileHonorType: types.string,
  seq: types.number,
});
export interface ISekaiUserProfileHonor
  extends Instance<typeof SekaiUserProfileHonor> {}

export const SekaiCustomProfileCardPosition = types.model({
  x: types.number,
  y: types.number,
  z: types.number,
});

export interface ISekaiCustomProfileCardPosition
  extends Instance<typeof SekaiCustomProfileCardPosition> {}

export const SekaiCustomProfileCardRotation = types.model({
  w: types.number,
  x: types.number,
  y: types.number,
  z: types.number,
});

export interface ISekaiCustomProfileCardRotation
  extends Instance<typeof SekaiCustomProfileCardRotation> {}

export const SekaiCustomProfileCardScale = types.model({
  x: types.number,
  y: types.number,
  z: types.number,
});

export interface ISekaiCustomProfileCardScale
  extends Instance<typeof SekaiCustomProfileCardScale> {}

export const SekaiCustomProfileCardObjectData = types.model({
  layer: types.number,
  lock: types.boolean,
  position: SekaiCustomProfileCardPosition,
  rotation: SekaiCustomProfileCardRotation,
  scale: SekaiCustomProfileCardScale,
  visible: types.boolean,
});

export interface ISekaiCustomProfileCardObjectData
  extends Instance<typeof SekaiCustomProfileCardObjectData> {}

export const SekaiCustomProfileCardBondsHonors = types.model({
  fullSize: types.boolean,
  id: types.number,
  inverse: types.boolean,
  objectData: SekaiCustomProfileCardObjectData,
  wordId: types.number,
});

export interface ISekaiCustomProfileCardBondsHonors
  extends Instance<typeof SekaiCustomProfileCardBondsHonors> {}

export const SekaiCustomProfileCardMember = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
  showMasterRank: types.boolean,
  type: types.number,
  useAfterSpecialTraining: types.boolean,
});

export interface ISekaiCustomProfileCardMember
  extends Instance<typeof SekaiCustomProfileCardMember> {}

export const SekaiCustomProfileCollections = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileCollections
  extends Instance<typeof SekaiCustomProfileCollections> {}

export const SekaiCustomProfileGeneralBackground = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileGeneralBackground
  extends Instance<typeof SekaiCustomProfileGeneralBackground> {}

export const SekaiCustomProfileGeneral = types.model({
  objectData: SekaiCustomProfileCardObjectData,
  type: types.number,
});

export interface ISekaiCustomProfileGeneral
  extends Instance<typeof SekaiCustomProfileGeneral> {}

export const SekaiCustomProfileHonor = types.model({
  fullSize: types.boolean,
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileHonor
  extends Instance<typeof SekaiCustomProfileHonor> {}

export const SekaiCustomProfileOther = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileOther
  extends Instance<typeof SekaiCustomProfileOther> {}

export const SekaiCustomProfileShape = types.model({
  alpha: types.number,
  colorId: types.number,
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
  outlineAlpha: types.number,
  outlineColorId: types.number,
  outlineSize: types.number,
});

export interface ISekaiCustomProfileShape
  extends Instance<typeof SekaiCustomProfileShape> {}

export const SekaiCustomProfileStandMembers = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileStandMembers
  extends Instance<typeof SekaiCustomProfileStandMembers> {}

export const SekaiCustomProfileStoryBackground = types.model({
  id: types.number,
  objectData: SekaiCustomProfileCardObjectData,
});

export interface ISekaiCustomProfileStoryBackground
  extends Instance<typeof SekaiCustomProfileStoryBackground> {}

export const SekaiCustomProfileText = types.model({
  colorId: types.number,
  fontId: types.number,
  lineSpacing: types.number,
  objectData: SekaiCustomProfileCardObjectData,
  outlineColorId: types.number,
  outlineSize: types.number,
  size: types.number,
  text: types.string,
  type: types.number,
});

export interface ISekaiCustomProfileText
  extends Instance<typeof SekaiCustomProfileText> {}

export const SekaiCustomProfileCard = types.model({
  bondsHonors: types.array(SekaiCustomProfileCardBondsHonors),
  cardMembers: types.array(SekaiCustomProfileCardMember),
  collections: types.array(SekaiCustomProfileCollections),
  generalBackgrounds: types.array(SekaiCustomProfileGeneralBackground),
  generals: types.array(SekaiCustomProfileGeneral),
  honors: types.array(SekaiCustomProfileHonor),
  others: types.array(SekaiCustomProfileOther),
  shapes: types.array(SekaiCustomProfileShape),
  standMembers: types.array(SekaiCustomProfileStandMembers),
  storyBackgrounds: types.array(SekaiCustomProfileStoryBackground),
  texts: types.array(SekaiCustomProfileText),
});

export interface ISekaiCustomProfileCard
  extends Instance<typeof SekaiCustomProfileCard> {}

export const SekaiUserCustomProfileCard = types.model({
  customProfileCard: types.maybe(SekaiCustomProfileCard),
  customProfileCardId: types.number,
  customProfileId: types.number,
  seq: types.number,
});

export interface ISekaiUserCustomProfileCard
  extends Instance<typeof SekaiUserCustomProfileCard> {}

export const SekaiUserConfig = types.model({
  friendRequestScope: types.string,
});

export interface ISekaiUserConfig extends Instance<typeof SekaiUserConfig> {}

export const SekaiUserData = types.model({
  user: SekaiUser,
  userAreaItems: types.array(SekaiUserAreaItem),
  userBondsHonors: types.maybe(types.array(SekaiUserBondsHonor)),
  userCards: types.array(SekaiUserCard),
  userChallengeLiveSoloResults: types.array(SekaiUserChallengeLiveSoloResult),
  userChallengeLiveSoloStages: types.array(SekaiUserChallengeLiveSoloStage),
  userCharacters: types.array(SekaiUserCharacter),
  userConfig: types.maybe(SekaiUserConfig),
  userCustomProfileCards: types.maybe(types.array(SekaiUserCustomProfileCard)),
  userDecks: types.array(SekaiUserDeck),
  userHonors: types.array(SekaiUserHonor),
  userMusicResults: types.maybe(types.array(SekaiUserMusicResult)),
  userMusics: types.array(SekaiUserMusic),
  userProfile: SekaiUserProfile,
  userProfileHonors: types.maybe(types.array(SekaiUserProfileHonor)),
});
export interface ISekaiUserData extends Instance<typeof SekaiUserData> {}

export const SekaiCardState = types.model({
  cardId: types.number,
  level: types.number,
  // power: types.number,
  masterRank: types.optional(types.number, 0),

  skillLevel: types.optional(types.number, 0),

  story1Unlock: types.optional(types.union(types.boolean, types.number), false),

  story2Unlock: types.optional(types.union(types.boolean, types.number), false),
  trainable: types.optional(types.union(types.boolean, types.number), false),
  trained: types.optional(types.union(types.boolean, types.number), false),
});
export interface ISekaiCardState extends Instance<typeof SekaiCardState> {}

export const SekaiDeck = types.model({
  id: types.optional(types.number, 99999999),
  teamCards: types.array(types.number),
  teamCardsStates: types.array(SekaiCardState),
  teamPowerStates: types.optional(types.number, 0),
  teamTotalPower: types.optional(types.number, 0),
});
export interface ISekaiDeck extends Instance<typeof SekaiDeck> {}

export const SekaiProfile = types.model({
  cardList: types.maybeNull(types.array(SekaiCardState)),
  dailySyncEnabled: types.boolean,
  deckList: types.maybeNull(types.array(SekaiDeck)),
  eventGetAvailable: types.number,
  eventGetUsed: types.number,
  eventHistorySync: types.boolean,
  id: types.number,
  region: types.string,
  sekaiUserId: types.maybeNull(types.string),
  sekaiUserProfile: types.maybeNull(SekaiUserData),
  sekaiUserToken: types.maybeNull(types.string),
  updateAvailable: types.number,
  updateUsed: types.number,
});
export interface ISekaiProfile extends Instance<typeof SekaiProfile> {}

export const SekaiCardTeam = types.model({
  cards: types.array(SekaiCardState),
  decks: types.array(SekaiDeck),
  id: types.number,
  maxNumOfDecks: types.number,
  region: types.string,
});
export interface ISekaiCardTeam extends Instance<typeof SekaiCardTeam> {}

export const SekaiProfileMap = types
  .model({
    isFetchingSekaiCardTeam: types.optional(types.boolean, false),
    isFetchingSekaiProfile: types.optional(types.boolean, false),
    sekaiCardTeamMap: types.map(SekaiCardTeam),
    sekaiProfileMap: types.map(SekaiProfile),
  })
  .actions((self) => ({
    deleteSekaiCardTeam(region: ServerRegion) {
      self.sekaiCardTeamMap.delete(region);
    },
    deleteSekaiProfile(region: ServerRegion) {
      self.sekaiProfileMap.delete(region);
    },
    fetchSekaiCardTeam: flow(function* (region: ServerRegion) {
      if (!self.isFetchingSekaiCardTeam) {
        self.isFetchingSekaiCardTeam = true;
        try {
          const res = yield axios.get<ISekaiProfile>("/sekai-card-teams/me", {
            baseURL: import.meta.env.VITE_STRAPI_BASE,
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              region,
            },
          });
          self.sekaiCardTeamMap.set(region, res.data);
        } catch (err) {
          console.error(err);
        }
        self.isFetchingSekaiCardTeam = false;
      }
    }),
    fetchSekaiProfile: flow(function* (region: ServerRegion) {
      if (!self.isFetchingSekaiProfile) {
        self.isFetchingSekaiProfile = true;
        try {
          const res = yield axios.get<ISekaiProfile>("/sekai-profiles/me", {
            baseURL: import.meta.env.VITE_STRAPI_BASE,
            headers: {
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
              region,
            },
          });
          self.sekaiProfileMap.set(region, res.data);
        } catch (err) {
          console.error(err);
        }
        self.isFetchingSekaiProfile = false;
      }
    }),
    logout() {
      self.sekaiProfileMap.clear();
      self.sekaiCardTeamMap.clear();
    },
    setSekaiCardTeam(
      sekaiCardTeam: Partial<ISekaiCardTeam>,
      region: ServerRegion
    ) {
      self.sekaiCardTeamMap.set(
        region,
        Object.assign({}, self.sekaiCardTeamMap.get(region), sekaiCardTeam)
      );
    },
    setSekaiProfile(
      sekaiProfile: Partial<ISekaiProfile>,
      region: ServerRegion
    ) {
      self.sekaiProfileMap.set(
        region,
        Object.assign({}, self.sekaiProfileMap.get(region), sekaiProfile)
      );
    },
  }));
export interface ISekaiProfileMap extends Instance<typeof SekaiProfileMap> {}
