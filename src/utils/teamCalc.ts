import { useCallback } from "react";
import { useCachedData } from ".";
import {
  IAreaItemLevel,
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
  const [areaItemLevels] = useCachedData<IAreaItemLevel>("areaItemLevels");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");
  const [characterRanks] = useCachedData<ICharacterRank>("characterRanks");
  const [honors] = useCachedData<IHonorInfo>("honors");

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
      //     userCards.some((card) => card.unit === il.targetUnit)
      //   )
      // );

      // characters
      const cardCharas = userCards.map((card) => card.characterId);
      const cardPowers = userTeamCardStates.map((state) => state.power);
      const cardCharaItemLevels = cardCharas.map((characterId) =>
        itemLevels.filter((il) => il.targetGameCharacterId === characterId)
      );
      const cardCharaBonuses = cardPowers.map((power, idx) =>
        cardCharaItemLevels[idx].reduce(
          (sum, item) => sum + Math.floor((power * item.power1BonusRate) / 100),
          0
        )
      );
      const cardCharaBonus = cardCharaBonuses.reduce(
        (sum, bonus) => sum + bonus,
        0
      );
      // console.log(cardCharaBonuses, cardCharaBonus);

      // attr
      const cardAttrs = userCards.map((card) => card.attr);
      const cardAttrsAllSame = Array.from(new Set(cardAttrs)).length === 1;
      const cardAttrItemLevels = cardAttrs.map((attr) =>
        itemLevels.filter((il) => il.targetCardAttr === attr)
      );
      const cardAttrBonuses = cardPowers.map((power, idx) =>
        cardAttrItemLevels[idx].reduce(
          (sum, item) =>
            sum +
            Math.floor(
              (power *
                item[
                  cardAttrsAllSame
                    ? "power1AllMatchBonusRate"
                    : "power1BonusRate"
                ]) /
                100
            ),
          0
        )
      );
      const cardAttrBonus = cardAttrBonuses.reduce(
        (sum, bonus) => sum + bonus,
        0
      );
      // console.log(cardAttrBonuses, cardAttrBonus);

      // team without piapro
      // check all same at first (all piapro or other with piapro same support unit)
      const cardUnits = userCards.map((card) => card.unit);
      const cardSupportUnits = userCards.map((card) =>
        card.unit === "piapro" ? card.supportUnit : card.unit
      );
      const cardUnitsAllSame =
        Array.from(new Set(cardUnits)).length === 1 ||
        Array.from(new Set(cardSupportUnits)).length === 1;
      const cardUnitItemLevels = cardUnits.map((unit) =>
        itemLevels.filter((il) => il.targetUnit === unit)
      );
      const cardUnitBonuses = cardPowers.map((power, idx) =>
        cardUnits[idx] === "piapro" // skip piapro for now
          ? 0
          : cardUnitItemLevels[idx].reduce(
              (sum, item) =>
                sum +
                Math.floor(
                  (power *
                    item[
                      cardUnitsAllSame
                        ? "power1AllMatchBonusRate"
                        : "power1BonusRate"
                    ]) /
                    100
                ),
              0
            )
      );
      const cardUnitBonus = cardUnitBonuses.reduce(
        (sum, bonus) => sum + bonus,
        0
      );
      // console.log(cardUnitBonuses, cardUnitBonus);

      // for piapro cards, calc bonus for targetUnit === "piapro" and targetUnit matching supportUnit
      const piaproCards = userCards.filter((card) => card.unit === "piapro");
      const piaproCardPowers = userTeamCardStates
        .filter((state) => piaproCards.some((card) => card.id === state.cardId))
        .map((state) => state.power);
      const piaproItemLevels = itemLevels.filter(
        (il) => il.targetUnit === "piapro"
      );
      const piaproCardBonuses = piaproCardPowers.map((power) =>
        piaproItemLevels.reduce(
          (sum, item) =>
            sum +
            Math.floor(
              (power *
                Math.ceil(
                  item[
                    cardUnitsAllSame
                      ? "power1AllMatchBonusRate"
                      : "power1BonusRate"
                  ] * 100
                )) /
                10000
            ),
          0
        )
      );
      const piaproCardBonus = piaproCardBonuses.reduce(
        (sum, bonus) => sum + bonus,
        0
      );
      // console.log(piaproCardBonuses, piaproCardBonus);

      const piaproSupportCards = userCards.filter(
        (card) => card.supportUnit !== "none"
      );
      const piaproSupportItemLevels = itemLevels.filter(
        (il) =>
          il.targetUnit !== "piapro" &&
          piaproSupportCards.some((card) => card.supportUnit === il.targetUnit)
      );
      const piaproSupportCardPowers = userTeamCardStates
        .filter((state) =>
          piaproSupportCards.some((card) => card.id === state.cardId)
        )
        .map((state) => state.power);
      const piaproSupportCardBonuses = piaproSupportCardPowers.map((power) =>
        piaproSupportItemLevels.reduce(
          (sum, item) =>
            sum +
            Math.floor(
              (power *
                item[
                  cardUnitsAllSame
                    ? "power1AllMatchBonusRate"
                    : "power1BonusRate"
                ]) /
                100
            ),
          0
        )
      );
      const piaproSupportCardBonus = piaproSupportCardBonuses.reduce(
        (sum, bonus) => sum + bonus,
        0
      );
      // console.log(piaproSupportCardBonuses, piaproSupportCardBonus);

      const piaproBonus =
        piaproCardBonus > piaproSupportCardBonus
          ? piaproCardBonus
          : piaproCardBonus;

      return cardCharaBonus + cardAttrBonus + cardUnitBonus + piaproBonus;
    },
    [areaItemLevels, cards, gameCharas]
  );

  const getCharacterRankBouns = useCallback(
    (userCharacters: UserCharacter[], userTeamCardStates: ITeamCardState[]) => {
      if (!characterRanks || !cards) return -1;

      const userCardCharas = userTeamCardStates
        .map((elem) => elem.cardId)
        .map((cardId) => cards.find((card) => card.id === cardId)!.characterId);

      return userCharacters
        .filter((chara) => userCardCharas.includes(chara.characterId))
        .reduce(
          (sum, chara) =>
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
                userTeamCardStates[userCardCharas.indexOf(chara.characterId)]
                  .power
            ),
          0
        );
    },
    [cards, characterRanks]
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

  return {
    getAreaItemBonus,
    getCharacterRankBouns,
    getHonorBonus,
  };
};
