import { useCallback, useMemo } from "react";
import { useCachedData } from ".";
import {
  IAreaItemLevel,
  ICardEpisode,
  ICardInfo,
  ICharacterRank,
  IGameChara,
  IHonorInfo,
  ITeamCardState,
  UserAreaItem,
  UserCharacter,
  UserHonor,
} from "../types";

export const useTeamCalc = () => {
  const [cards] = useCachedData<ICardInfo>("cards");
  const [cardEpisodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [areaItemLevels] = useCachedData<IAreaItemLevel>("areaItemLevels");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");
  const [characterRanks] = useCachedData<ICharacterRank>("characterRanks");
  const [honors] = useCachedData<IHonorInfo>("honors");

  const masterRankRewards = useMemo(() => [0, 50, 100, 150, 200], []);

  const getUserCardPowers = useCallback(
    (
      userTeamCardStates: ITeamCardState[],
      userCards: (ICardInfo & {
        unit: string;
      })[]
    ) => {
      if (!cardEpisodes || !masterRankRewards) return;

      const userCardPowers = userTeamCardStates.map((state, idx) =>
        userCards[idx].cardParameters
          .filter((param) => param.cardLevel === state.level)
          .sort((a, b) =>
            a.cardParameterType > b.cardParameterType
              ? 1
              : a.cardParameterType < b.cardParameterType
              ? -1
              : 0
          )
          .map((param) => param.power)
      );
      const userCardTrainingRewards = userTeamCardStates.map((state, idx) => {
        const card = userCards[idx];
        return state.trained ? card.specialTrainingPower1BonusFixed : 0;
      });
      const userCardEpisodeRewards = userTeamCardStates.map((state, idx) => {
        const card = userCards[idx];
        const episodes = cardEpisodes.filter((ce) => ce.cardId === card.id);
        return (
          Number(state.story1Unlock) * episodes[0].power1BonusFixed +
          Number(state.story2Unlock) * episodes[1].power1BonusFixed
        );
      });
      const userCardMasterRankRewards = userTeamCardStates.map((state, idx) => {
        const card = userCards[idx];
        return masterRankRewards[card.rarity] * state.masterRank;
      });
      // console.log(
      //   userCardPowers,
      //   userCardTrainingRewards,
      //   userCardEpisodeRewards,
      //   userCardMasterRankRewards
      // );

      return userCardPowers.map((powers, idx) =>
        powers.map(
          (power) =>
            power +
            userCardTrainingRewards[idx] +
            userCardEpisodeRewards[idx] +
            userCardMasterRankRewards[idx]
        )
      );
    },
    [cardEpisodes, masterRankRewards]
  );

  /**
   * Take user cards, states to calculate the bonus provided by area items.
   * @param userTeamCardStates states of user cards.
   * @param userAreaItems user area items mapped into IAreaItemLevel with areaItemLevels from db.
   */
  const getAreaItemBonus = useCallback(
    (userTeamCardStates: ITeamCardState[], userAreaItems: UserAreaItem[]) => {
      if (!cards || !areaItemLevels || !gameCharas) return -1;

      const userCards = userTeamCardStates
        .map((elem) => elem.cardId)
        .map((cardId) => cards.find((card) => card.id === cardId)!)
        .map((card) =>
          Object.assign({}, card, {
            unit: gameCharas.find((gc) => gc.id === card.characterId)!.unit,
          })
        );
      // [[power1, power2, power3], [power1, power2, power3]...]
      const userCardPowers = getUserCardPowers(userTeamCardStates, userCards);
      // console.log(userCardPowers);
      if (!userCardPowers) return -1;

      const itemLevels = userAreaItems.map(
        (elem) =>
          areaItemLevels.find(
            (ai) => ai.areaItemId === elem.areaItemId && ai.level === elem.level
          )!
      );
      // console.log(
      //   itemLevels,
      //   itemLevels.filter((il) =>
      //     userCards.some(
      //       (card) => card.characterId === il.targetGameCharacterId
      //     )
      //   ),
      //   itemLevels.filter((il) =>
      //     userCards.some((card) => card.attr === il.targetCardAttr)
      //   ),
      //   itemLevels.filter((il) =>
      //     userCards.some(
      //       (card) =>
      //         card.unit === il.targetUnit || card.supportUnit === il.targetUnit
      //     )
      //   )
      // );

      // characters
      const cardCharas = userCards.map((card) => card.characterId);
      const cardCharaItemLevels = cardCharas.map((characterId) =>
        itemLevels.filter((il) => il.targetGameCharacterId === characterId)
      );
      const cardCharaBonusRates = cardCharaItemLevels.map((itemLevels) =>
        Number(
          itemLevels
            .reduce((sum, item) => sum + item["power1BonusRate"], 0)
            .toPrecision(3)
        )
      );

      // attr
      const cardAttrs = userCards.map((card) => card.attr);
      const cardAttrsAllSame = Array.from(new Set(cardAttrs)).length === 1;
      const cardAttrItemLevels = cardAttrs.map((attr) =>
        itemLevels.filter((il) => il.targetCardAttr === attr)
      );
      const cardAttrBonusRates = cardAttrItemLevels.map((itemLevels) =>
        Number(
          itemLevels
            .reduce(
              (sum, item) =>
                sum +
                item[
                  cardAttrsAllSame
                    ? "power1AllMatchBonusRate"
                    : "power1BonusRate"
                ],
              0
            )
            .toPrecision(3)
        )
      );

      // team without piapro
      // check all same at first (all piapro or other with piapro same support unit)
      const cardUnits = userCards.map((card) => card.unit);
      const cardSupportUnits = userCards.map((card) =>
        card.unit === "piapro" ? card.supportUnit : card.unit
      );
      const cardUnitsAllSame =
        userCards.length === 5 &&
        Array.from(new Set(cardSupportUnits)).length === 1;
      const cardUnitItemLevels = cardSupportUnits.map((unit) =>
        itemLevels.filter((il) => il.targetUnit === unit)
      );
      const cardUnitBonusRates = cardUnitItemLevels.map((itemLevels) =>
        Number(
          itemLevels
            .reduce(
              (sum, item) =>
                sum +
                item[
                  cardUnitsAllSame
                    ? "power1AllMatchBonusRate"
                    : "power1BonusRate"
                ],
              0
            )
            .toPrecision(3)
        )
      );

      // for piapro cards, calc bonus for supportUnit
      const piaproCardIdxs = userCards
        .map((_, idx) => idx)
        .filter((idx) => userCards[idx].supportUnit !== "none");
      const piaproCards = userCards.filter((card) => card.unit === "piapro");
      const isAllPiapro = piaproCards.length === 5;
      const piaproSupportItemLevels = itemLevels.filter(
        (il) => il.targetUnit === "piapro"
      );
      const piaproBonusRate = Number(
        piaproSupportItemLevels
          .reduce(
            (sum, item) =>
              sum +
              item[isAllPiapro ? "power1AllMatchBonusRate" : "power1BonusRate"],
            0
          )
          .toPrecision(3)
      );

      piaproCardIdxs.forEach((idx) => {
        cardUnitBonusRates[idx] = Math.max(
          cardUnitBonusRates[idx],
          piaproBonusRate
        );
      });

      // sum all bonus rates
      const sumBonusRates = userCards.map(
        (_, idx) =>
          cardCharaBonusRates[idx] +
          cardAttrBonusRates[idx] +
          cardUnitBonusRates[idx]
      );

      console.log(sumBonusRates);

      return sumBonusRates.reduce(
        (sum, bonusRate, idx) =>
          sum +
          Math.floor((userCardPowers[idx][0] * bonusRate) / 100) +
          Math.floor((userCardPowers[idx][1] * bonusRate) / 100) +
          Math.floor((userCardPowers[idx][2] * bonusRate) / 100),
        0
      );
    },
    [areaItemLevels, cards, gameCharas, getUserCardPowers]
  );

  const getCharacterRankBonus = useCallback(
    (userCharacters: UserCharacter[], userTeamCardStates: ITeamCardState[]) => {
      if (!characterRanks || !cards || !gameCharas) return -1;

      const userCardCharas = userTeamCardStates
        .map((elem) => elem.cardId)
        .map((cardId) => cards.find((card) => card.id === cardId)!.characterId)
        .map(
          (charaId) =>
            userCharacters.find((chara) => chara.characterId === charaId)!
        );

      const userCards = userTeamCardStates
        .map((elem) => elem.cardId)
        .map((cardId) => cards.find((card) => card.id === cardId)!)
        .map((card) =>
          Object.assign({}, card, {
            unit: gameCharas.find((gc) => gc.id === card.characterId)!.unit,
          })
        );

      // [[power1, power2, power3], [power1, power2, power3]...]
      const userCardPowers = getUserCardPowers(userTeamCardStates, userCards);
      if (!userCardPowers) return -1;

      return userCardCharas.reduce(
        (sum, chara, idx) =>
          sum +
          Math.floor(
            (Math.round(
              characterRanks.find(
                (cr) =>
                  cr.characterId === chara.characterId &&
                  cr.characterRank === chara.characterRank
              )!.power1BonusRate * 100
            ) /
              10000) *
              userCardPowers[idx][0]
          ) +
          Math.floor(
            (Math.round(
              characterRanks.find(
                (cr) =>
                  cr.characterId === chara.characterId &&
                  cr.characterRank === chara.characterRank
              )!.power2BonusRate * 100
            ) /
              10000) *
              userCardPowers[idx][1]
          ) +
          Math.floor(
            (Math.round(
              characterRanks.find(
                (cr) =>
                  cr.characterId === chara.characterId &&
                  cr.characterRank === chara.characterRank
              )!.power3BonusRate * 100
            ) /
              10000) *
              userCardPowers[idx][2]
          ),
        0
      );
    },
    [cards, characterRanks, gameCharas, getUserCardPowers]
  );

  const getHonorBonus = useCallback(
    (userHonors: UserHonor[]) => {
      if (!honors) return -1;

      return userHonors.reduce(
        (sum, honor) =>
          sum +
          honors
            .find((elem) => elem.id === honor.honorId)!
            .levels.find((level) => level.level === honor.level)!.bonus,
        0
      );
    },
    [honors]
  );

  const getPureTeamPowers = useCallback(
    (userTeamCardStates: ITeamCardState[]) => {
      if (!characterRanks || !cards || !gameCharas) return -1;

      const userCards = userTeamCardStates
        .map((elem) => elem.cardId)
        .map((cardId) => cards.find((card) => card.id === cardId)!)
        .map((card) =>
          Object.assign({}, card, {
            unit: gameCharas.find((gc) => gc.id === card.characterId)!.unit,
          })
        );

      // [[power1, power2, power3], [power1, power2, power3]...]
      const userCardPowers = getUserCardPowers(userTeamCardStates, userCards);
      if (!userCardPowers) return -1;

      return userCardPowers.reduce(
        (sum, powers) => sum + powers.reduce((_sum, power) => _sum + power, 0),
        0
      );
    },
    [cards, characterRanks, gameCharas, getUserCardPowers]
  );

  return {
    getAreaItemBonus,
    getCharacterRankBonus,
    getHonorBonus,
    getPureTeamPowers,
  };
};
