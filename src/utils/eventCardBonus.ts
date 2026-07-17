import {
  EventCardBonus,
  ICardInfo,
  IEventCard,
  IEventDeckBonus,
  IGameCharaUnit,
} from "../types";

const masterRankBonusVersions: Record<number, Record<string, number[]>> = {
  35: {
    rarity_1: [0, 0, 0, 0, 0, 0],
    rarity_2: [0, 0, 0, 0, 0, 0],
    rarity_3: [0, 0, 0, 0, 0, 0],
    rarity_4: [0, 0, 0, 0, 0, 0],
    rarity_birthday: [0, 0, 0, 0, 0, 0],
  },
  53: {
    rarity_1: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rarity_2: [0, 0.2, 0.4, 0.6, 0.8, 1],
    rarity_3: [0, 1, 2, 3, 4, 5],
    rarity_4: [0, 2, 4, 6, 8, 10],
    rarity_birthday: [0, 1.5, 3, 4.5, 6, 7.5],
  },
  107: {
    rarity_1: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rarity_2: [0, 0.2, 0.4, 0.6, 0.8, 1],
    rarity_3: [0, 1, 2, 3, 4, 5],
    rarity_4: [0, 10, 11, 12, 13, 15],
    rarity_birthday: [0, 5, 6, 7, 8, 10],
  },
  999: {
    rarity_1: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rarity_2: [0, 0.2, 0.4, 0.6, 0.8, 1],
    rarity_3: [0, 1, 2, 3, 4, 5],
    rarity_4: [10, 12.5, 15, 17.5, 20, 25],
    rarity_birthday: [5, 7, 9, 11, 13, 15],
  },
};

function calc(
  eventId: number,
  card: ICardInfo,
  eventDeckBonuses: IEventDeckBonus[],
  gameCharacterUnits: IGameCharaUnit[],
  eventCard?: IEventCard
): EventCardBonus {
  let baseBonus = 0;

  // event card provides base bonus
  if (eventCard) {
    baseBonus += eventCard.bonusRate;
  }

  // add up the deck bonuses
  const deckBonus = eventDeckBonuses.find((edb) => {
    if (edb.cardAttr && !edb.gameCharacterUnitId)
      return edb.cardAttr === card.attr;

    const gcu = gameCharacterUnits.find(
      (gcu) => gcu.id === edb.gameCharacterUnitId
    );
    if (!gcu || gcu.gameCharacterId !== card.characterId) return false;

    const attrMatch = !edb.cardAttr || edb.cardAttr === card.attr;
    return card.characterId < 21
      ? attrMatch
      : attrMatch && (gcu.unit === "piapro" || card.supportUnit === gcu.unit);
  });
  baseBonus += deckBonus ? deckBonus.bonusRate : 0;

  if (card.characterId >= 21) {
    const deckBonusGameCharacterUnitIds = Array.from(
      new Set(
        eventDeckBonuses
          .filter((edb) => edb.gameCharacterUnitId)
          .map((edb) => edb.gameCharacterUnitId!)
      )
    );
    // find the game character unit for current virtual singer
    const virtualSingerGameCharacterUnit = gameCharacterUnits.find(
      (gcu) =>
        deckBonusGameCharacterUnitIds.includes(gcu.id) &&
        gcu.gameCharacterId === card.characterId
    );
    if (virtualSingerGameCharacterUnit) {
      if (
        virtualSingerGameCharacterUnit.unit === "piapro" ||
        card.supportUnit === "none"
      ) {
        baseBonus += 15; // add 15% bonus for virtual singer without support unit
        if (eventId >= 135) {
          baseBonus += 10; // add extra 10% bonus for events after event 135
        }
      }
    }
  }

  // add up the master rank bonus
  const masterRankBonusVersion = Object.entries(masterRankBonusVersions).find(
    ([maxEventId]) => eventId <= Number(maxEventId)
  )![1];
  const minMasterRankBonus = masterRankBonusVersion[card.cardRarityType][0];
  const maxMasterRankBonus = masterRankBonusVersion[card.cardRarityType][5];

  return {
    card,
    minBonus: baseBonus + minMasterRankBonus,
    maxBonus: baseBonus + maxMasterRankBonus,
  };
}

export default calc;
