import axios from "axios";
import { types, Instance, flow } from "mobx-state-tree";
import { ServerRegion } from "../types";

export const SekaiUserGamedata = types.model({
  userId: types.number,
  name: types.string,
  deck: types.number,
  rank: types.number,
});
export interface ISekaiUserGamedata
  extends Instance<typeof SekaiUserGamedata> {}

export const SekaiUser = types.model({
  userGamedata: SekaiUserGamedata,
});
export interface ISekaiUser extends Instance<typeof SekaiUser> {}

export const SekaiUserProfile = types.model({
  userId: types.number,
  word: types.string,
  honorId1: types.number,
  honorLevel1: types.number,
  honorId2: types.number,
  honorLevel2: types.number,
  honorId3: types.number,
  honorLevel3: types.number,
  twitterId: types.string,
  profileImageType: types.string,
});
export interface ISekaiUserProfile extends Instance<typeof SekaiUserProfile> {}

export const SekaiUserDeck = types.model({
  leader: types.number,
  member1: types.number,
  member2: types.number,
  member3: types.number,
  member4: types.number,
  member5: types.number,
});
export interface ISekaiUserDeck extends Instance<typeof SekaiUserDeck> {}

export const SekaiUserCardEpisode = types.model({
  cardEpisodeId: types.number,
  scenarioStatus: types.string,
  scenarioStatusReasons: types.array(types.string),
  isNotSkipped: types.boolean,
});
export interface ISekaiUserCardEpisode
  extends Instance<typeof SekaiUserCardEpisode> {}

export const SekaiUserCard = types.model({
  cardId: types.number,
  level: types.number,
  masterRank: types.number,
  specialTrainingStatus: types.string,
  defaultImage: types.string,
  episodes: types.array(SekaiUserCardEpisode),
});
export interface ISekaiUserCard extends Instance<typeof SekaiUserCard> {}

export const SekaiUserMusicResult = types.model({
  userId: types.number,
  musicId: types.number,
  musicDifficulty: types.string,
  playType: types.string,
  playResult: types.string,
  highScore: types.number,
  fullComboFlg: types.boolean,
  fullPerfectFlg: types.boolean,
  mvpCount: types.number,
  superStarCount: types.number,
  createdAt: types.number,
  updatedAt: types.number,
});
export interface ISekaiUserMusicResult
  extends Instance<typeof SekaiUserMusicResult> {}

export const SekaiUserMusicDifficultyStatus = types.model({
  musicId: types.number,
  musicDifficulty: types.string,
  musicDifficultyStatus: types.string,
  userMusicResults: types.array(SekaiUserMusicResult),
});
export interface ISekaiUserMusicDifficultyStatus
  extends Instance<typeof SekaiUserMusicDifficultyStatus> {}

export const SekaiUserMusic = types.model({
  userId: types.number,
  musicId: types.number,
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
  challengeLiveStageType: types.string,
  characterId: types.number,
  challengeLiveStageId: types.number,
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
  userId: types.number,
  honorId: types.number,
  level: types.number,
  obtainedAt: types.number,
});
export interface ISekaiUserHonor extends Instance<typeof SekaiUserHonor> {}

export const SekaiUserData = types.model({
  user: SekaiUser,
  userProfile: SekaiUserProfile,
  userDecks: types.array(SekaiUserDeck),
  userCards: types.array(SekaiUserCard),
  userMusics: types.array(SekaiUserMusic),
  userCharacters: types.array(SekaiUserCharacter),
  userChallengeLiveSoloResults: types.array(SekaiUserChallengeLiveSoloResult),
  userChallengeLiveSoloStages: types.array(SekaiUserChallengeLiveSoloStage),
  userAreaItems: types.array(SekaiUserAreaItem),
  userHonors: types.array(SekaiUserHonor),
});
export interface ISekaiUserData extends Instance<typeof SekaiUserData> {}

export const SekaiCardState = types.model({
  cardId: types.number,
  level: types.number,
  skillLevel: types.optional(types.number, 0),
  trained: types.optional(types.boolean, false),
  trainable: types.optional(types.boolean, false),
  // power: types.number,
  masterRank: types.optional(types.number, 0),
  story1Unlock: types.optional(types.boolean, false),
  story2Unlock: types.optional(types.boolean, false),
});
export interface ISekaiCardState extends Instance<typeof SekaiCardState> {}

export const SekaiDeck = types.model({
  id: types.optional(types.number, 99999999),
  teamCards: types.array(types.number),
  teamCardsStates: types.array(SekaiCardState),
  teamTotalPower: types.optional(types.number, 0),
  teamPowerStates: types.optional(types.number, 0),
});
export interface ISekaiDeck extends Instance<typeof SekaiDeck> {}

export const SekaiProfile = types.model({
  id: types.number,
  sekaiUserId: types.maybeNull(types.string),
  sekaiUserProfile: types.maybeNull(SekaiUserData),
  sekaiUserToken: types.maybeNull(types.string),
  updateAvailable: types.number,
  updateUsed: types.number,
  eventGetAvailable: types.number,
  eventGetUsed: types.number,
  eventHistorySync: types.boolean,
  dailySyncEnabled: types.boolean,
  region: types.string,
  cardList: types.maybeNull(types.array(SekaiCardState)),
  deckList: types.maybeNull(types.array(SekaiDeck)),
});
export interface ISekaiProfile extends Instance<typeof SekaiProfile> {}

export const SekaiCardTeam = types.model({
  id: types.number,
  cards: types.array(SekaiCardState),
  decks: types.array(SekaiDeck),
  maxNumOfDecks: types.number,
  region: types.string,
});
export interface ISekaiCardTeam extends Instance<typeof SekaiCardTeam> {}

export const SekaiProfileMap = types
  .model({
    sekaiProfileMap: types.map(SekaiProfile),
    isFetchingSekaiProfile: types.optional(types.boolean, false),
    sekaiCardTeamMap: types.map(SekaiCardTeam),
    isFetchingSekaiCardTeam: types.optional(types.boolean, false),
  })
  .views((self) => ({
    getSekaiProfile(region: string) {
      return self.sekaiProfileMap.get(region);
    },
    getSekaiCardTeam(region: string) {
      return self.sekaiCardTeamMap.get(region);
    },
  }))
  .actions((self) => ({
    setSekaiProfile(sekaiProfile: ISekaiProfile, region: ServerRegion) {
      self.sekaiProfileMap.set(region, sekaiProfile);
    },
    deleteSekaiProfile(region: ServerRegion) {
      self.sekaiProfileMap.delete(region);
    },
    fetchSekaiProfile: flow(function* (region: ServerRegion) {
      if (!self.isFetchingSekaiProfile) {
        self.isFetchingSekaiProfile = true;
        try {
          const res = yield axios.get<ISekaiProfile>("/sekai-profiles/me", {
            baseURL: import.meta.env.VITE_STRAPI_BASE,
            headers: {
              region,
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          self.sekaiProfileMap.set(region, res.data);
        } catch (err) {
          console.error(err);
        }
        self.isFetchingSekaiProfile = false;
      }
    }),
    setSekaiCardTeam(sekaiCardTeam: ISekaiCardTeam, region: ServerRegion) {
      self.sekaiCardTeamMap.set(region, sekaiCardTeam);
    },
    deleteSekaiCardTeam(region: ServerRegion) {
      self.sekaiCardTeamMap.delete(region);
    },
    fetchSekaiCardTeam: flow(function* (region: ServerRegion) {
      if (!self.isFetchingSekaiCardTeam) {
        self.isFetchingSekaiCardTeam = true;
        try {
          const res = yield axios.get<ISekaiProfile>("/sekai-card-teams/me", {
            baseURL: import.meta.env.VITE_STRAPI_BASE,
            headers: {
              region,
              authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          self.sekaiCardTeamMap.set(region, res.data);
        } catch (err) {
          console.error(err);
        }
        self.isFetchingSekaiCardTeam = false;
      }
    }),
    logout() {
      self.sekaiProfileMap.clear();
      self.sekaiCardTeamMap.clear();
    },
  }));
export interface ISekaiProfileMap extends Instance<typeof SekaiProfileMap> {}
