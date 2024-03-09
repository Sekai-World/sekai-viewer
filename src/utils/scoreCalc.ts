import { useCallback } from "react";
import { sortWithIndices } from ".";
import { ISekaiCardState } from "../stores/sekai";
import {
  EventType,
  ICardInfo,
  IMusicMeta,
  ISkillInfo,
  // ITeamCardState,
} from "../types";

const boostRate: Record<number, number> = {
  0: 1,
  1: 5,
  10: 35,
  2: 10,
  3: 15,
  4: 19,
  5: 23,
  6: 26,
  7: 29,
  8: 31,
  9: 33,
};

export function useScoreCalc() {
  const getCardSkillRate = useCallback(
    (cards: ICardInfo[], skills: ISkillInfo[], teamCard: ISekaiCardState) => {
      const skillId = cards.filter((it) => it.id === teamCard.cardId)[0]
        .skillId;
      const skill = skills.filter((it) => it.id === skillId)[0];
      const scoreSkill = skill.skillEffects.filter((it) =>
        it.skillEffectType.includes("score_up")
      )[0];
      return (
        scoreSkill.skillEffectDetails[teamCard.skillLevel - 1]
          .activateEffectValue / 100
      );
    },
    []
  );
  const getCardSkillRates = useCallback(
    (
      cards: ICardInfo[],
      skills: ISkillInfo[],
      teamCards: ISekaiCardState[]
    ) => {
      const skillRates: number[] = [];
      teamCards.forEach((it) => {
        skillRates.push(getCardSkillRate(cards, skills, it));
      });
      return skillRates;
    },
    [getCardSkillRate]
  );

  const getMultiSkillRate = useCallback((skillRates: number[]) => {
    let multiSkillRate = 1 + skillRates[0];
    skillRates.forEach((v, i) => {
      if (i > 0) multiSkillRate += v / 5;
    });
    return multiSkillRate;
  }, []);
  const getMultiAverageSkillRates = useCallback(
    (skillRates: number[]) => {
      const averageSkillRates: number[] = [];
      const rate = getMultiSkillRate(skillRates);
      for (let i = 0; i < 6; ++i) {
        averageSkillRates.push(rate);
      }
      return averageSkillRates;
    },
    [getMultiSkillRate]
  );

  const getSoloAverageSkillRate = useCallback((skillRates: number[]) => {
    let skillRate = 0;
    skillRates.forEach((v) => {
      skillRate += v;
    });
    return skillRate / skillRates.length;
  }, []);
  const getSoloAverageSkillRates = useCallback(
    (skillRates: number[]) => {
      const averageSkillRates: number[] = [];
      const rate = getSoloAverageSkillRate(skillRates);
      for (let i = 0; i < 5; i += 1) {
        averageSkillRates.push(i < skillRates.length ? rate : 0);
      }
      averageSkillRates.push(skillRates[0]);
      return averageSkillRates;
    },
    [getSoloAverageSkillRate]
  );

  const getSoloWorstSkillOrderAndRates = useCallback(
    (skillRates: number[], meta: IMusicMeta) => {
      const worstSkillRates: number[] = [];
      const skillScoreIndices = sortWithIndices(
        meta.skill_score_solo.slice(0, 5)
      );
      for (let i = 0; i < 5; i += 1) {
        worstSkillRates.push(i < skillRates.length ? skillRates[i] : 0);
      }
      worstSkillRates.sort().reverse();
      const _copy = worstSkillRates.slice();
      const memberIndices: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        worstSkillRates[skillScoreIndices[i]] = _copy[i];
        memberIndices.push(
          skillRates.findIndex(
            (elem) => elem === worstSkillRates[skillScoreIndices[i]]
          )
        );
      }
      worstSkillRates.push(skillRates[0]);
      return [worstSkillRates, memberIndices];
    },
    []
  );

  const getSoloBestSkillOrderAndRates = useCallback(
    (skillRates: number[], meta: IMusicMeta) => {
      const bestSkillRates: number[] = [];
      const skillScoreIndices = sortWithIndices(
        meta.skill_score_solo.slice(0, 5)
      );
      for (let i = 0; i < 5; i += 1) {
        bestSkillRates.push(i < skillRates.length ? skillRates[i] : 0);
      }
      bestSkillRates.sort();
      const _copy = bestSkillRates.slice();
      const memberIndices: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        bestSkillRates[skillScoreIndices[i]] = _copy[i];
        memberIndices.push(
          skillRates.findIndex(
            (elem) => elem === bestSkillRates[skillScoreIndices[i]]
          )
        );
      }
      bestSkillRates.push(skillRates[0]);
      return [bestSkillRates, memberIndices];
    },
    []
  );

  const getScore = useCallback(
    (meta: IMusicMeta, power: number, skillRates: number[], solo: boolean) => {
      let score = meta.base_score;
      const skillScore = solo ? meta.skill_score_solo : meta.skill_score_multi;
      skillRates.forEach((v, i) => {
        score += skillScore[i] * v;
      });
      if (!solo) score += meta.fever_score;
      return Math.floor(score * 4 * power);
    },
    []
  );

  const getEventPoint = useCallback(
    (
      selfScore: number,
      otherScore: number,
      musicRate: number,
      unitRate: number,
      boostCost: number,
      mode: EventType,
      leftLife?: number
    ): number => {
      // console.log(mode);
      switch (mode) {
        case "marathon": {
          const basePoint =
            100 +
            Math.floor(Math.min(selfScore, 4200000) / 20000) +
            Math.floor(Math.min(otherScore, 1100000) / 100000);
          const eventPoint = Math.floor(basePoint * musicRate * unitRate);
          return eventPoint * boostRate[boostCost];
        }
        case "cheerful_carnival": {
          const basePoint =
            100 +
            Math.floor(Math.min(selfScore, 4200000) / 20000) +
            Math.floor(Math.min(otherScore, 1100000) / 100000) +
            Math.min(leftLife || 1000, 1000) / 20;
          const eventPoint = Math.floor(basePoint * musicRate * unitRate);
          return eventPoint * boostRate[boostCost];
        }
        case "challenge_live": {
          const eventPoint = (100 + Math.floor(selfScore / 20000)) * 120;
          return eventPoint;
        }
      }
    },
    []
  );
  const getEventPointPerHour = useCallback(
    (
      selfScore: number,
      otherScore: number,
      musicRate: number,
      unitRate: number,
      boostCost: number,
      musicTime: number,
      mode: EventType,
      leftLife?: number
    ): number => {
      const point = getEventPoint(
        selfScore,
        otherScore,
        musicRate,
        unitRate,
        boostCost,
        mode,
        leftLife
      );
      const fullTime = musicTime + 30;
      const pointPerSecond = point / fullTime;
      return pointPerSecond * 3600;
    },
    [getEventPoint]
  );

  return {
    getCardSkillRate,
    getCardSkillRates,
    getEventPoint,
    getEventPointPerHour,
    getMultiAverageSkillRates,
    getMultiSkillRate,
    getScore,
    getSoloAverageSkillRate,
    getSoloAverageSkillRates,
    getSoloBestSkillOrderAndRates,
    getSoloWorstSkillOrderAndRates,
  };
}
