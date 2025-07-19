import {
  IMysekaiFixtureInfo,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
  IGameChara,
  IMysekaiBlueprint,
  IMysekaiBlueprintMaterialCost,
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  MysekaiDataContext,
} from "../types";

import { getRemoteAssetURL } from "./index";

export const charaMap = (id: number) => {
  if (isVirtualSinger(id)) {
    return Math.floor((id - 27) / 5) + 21;
  }
  return id;
};

// Virtual singers with unit variants (27-56)
export const unitMapping: { [key: number]: string } = {
  21: "piapro",
  22: "piapro",
  23: "piapro",
  24: "piapro",
  25: "piapro",
  26: "piapro",
  27: "light_sound",
  28: "idol",
  29: "street",
  30: "theme_park",
  31: "school_refusal", // Miku
  32: "light_sound",
  33: "idol",
  34: "street",
  35: "theme_park",
  36: "school_refusal", // Rin
  37: "light_sound",
  38: "idol",
  39: "street",
  40: "theme_park",
  41: "school_refusal", // Len
  42: "light_sound",
  43: "idol",
  44: "street",
  45: "theme_park",
  46: "school_refusal", // Luka
  47: "light_sound",
  48: "idol",
  49: "street",
  50: "theme_park",
  51: "school_refusal", // Meiko
  52: "light_sound",
  53: "idol",
  54: "street",
  55: "theme_park",
  56: "school_refusal", // Kaito
};

// Map character ID to unit based on the character mapping
export const getCharacterUnit = (
  id: number,
  charas?: IGameChara[]
): string | null => {
  // Regular unit members
  const chara = charas?.find((c) => c.id === id);
  if (chara && !isVirtualSinger(id)) {
    return chara.unit;
  }

  return unitMapping[id] || null;
};

export const isVirtualSinger = (id: number) => {
  return id > 20 && id < 57;
};

export const getGenreName = (
  genreId: number,
  genres?: IMysekaiFixtureGenre[]
) => {
  const genre = genres?.find((g) => g.id === genreId);
  return genre?.name || "";
};

export const getSubGenreName = (
  subGenreId: number,
  subGenres?: IMysekaiFixtureGenre[]
) => {
  const subGenre = subGenres?.find((sg) => sg.id === subGenreId);
  return subGenre?.name || "";
};

export const getTagNames = (
  tagGroup: { [key: string]: number },
  tags?: IMysekaiFixtureTag[]
) => {
  const tagNames: string[] = [];

  Object.entries(tagGroup).forEach(([key, value]) => {
    if (key !== "id") {
      const tag = tags?.find((t) => t.id === value);
      if (tag) tagNames.push(tag.name);
    }
  });

  return tagNames;
};

export function getFixtureTalkData(
  fixture: IMysekaiFixtureInfo,
  data: MysekaiDataContext
): IMysekaiTalk[] {
  if (
    !data.talkConditions?.length ||
    !data.talkConditionGroups?.length ||
    !data.talks?.length ||
    !data.characterGroups?.length
  ) {
    return [];
  }

  const fixtureToTalkMap = createFixtureToTalkMap([fixture], data);
  return fixtureToTalkMap.get(fixture.id) || [];
}

export function createFixtureToTalkMap(
  fixtures: IMysekaiFixtureInfo[],
  dataContext: MysekaiDataContext
): Map<number, IMysekaiTalk[]> {
  const fixtureToTalkMap = new Map<number, IMysekaiTalk[]>();

  if (
    !dataContext.talkConditions ||
    !dataContext.talkConditionGroups ||
    !dataContext.talks ||
    !dataContext.characterGroups
  ) {
    return fixtureToTalkMap;
  }

  // Initialize empty arrays for each fixture
  fixtures.forEach((fixture) => {
    fixtureToTalkMap.set(fixture.id, []);
  });

  // Find all talk conditions that reference fixtures
  const fixtureTalkConditions = dataContext.talkConditions.filter(
    (tc) => tc.mysekaiCharacterTalkConditionType === "mysekai_fixture_id"
  );

  // For each fixture-related condition, collect talks and populate gameCharacterIds
  fixtureTalkConditions.forEach((condition) => {
    const fixtureId = condition.mysekaiCharacterTalkConditionTypeValue;

    // Only process if this fixture is in our list
    if (!fixtureToTalkMap.has(fixtureId)) return;

    // Find condition groups that use this condition
    const conditionGroups = dataContext.talkConditionGroups!.filter(
      (tcg) => tcg.mysekaiCharacterTalkConditionId === condition.id
    );

    // For each condition group, find and process the talks
    conditionGroups.forEach((conditionGroup) => {
      const groupTalks = dataContext.talks!.filter(
        (talk) =>
          talk.mysekaiCharacterTalkConditionGroupId === conditionGroup.groupId
      );

      // Process each talk to populate gameCharacterIds array
      const processedTalks = groupTalks.map((talk) => {
        const gameCharacterIds: number[] = [];

        // Extract all character IDs from character group
        const charGroup = dataContext.characterGroups!.find(
          (chg: IMysekaiGameCharacterUnitGroups) =>
            chg.id === talk.mysekaiGameCharacterUnitGroupId
        );

        if (charGroup) {
          // Extract all character IDs by parsing the actual keys
          Object.entries(charGroup).forEach(([key, value]) => {
            if (
              key.startsWith("gameCharacterUnitId") &&
              typeof value === "number" &&
              value > 0
            ) {
              gameCharacterIds.push(value);
            }
          });
        }

        return {
          ...talk,
          gameCharacterIds,
        };
      });

      const existingTalks = fixtureToTalkMap.get(fixtureId) || [];
      fixtureToTalkMap.set(fixtureId, [...existingTalks, ...processedTalks]);
    });
  });

  return fixtureToTalkMap;
}

export function createFixtureToCharacterMap(
  fixtures: IMysekaiFixtureInfo[],
  dataContext: MysekaiDataContext
): Map<number, number[]> {
  const fixtureToCharacterMap = new Map<number, number[]>();
  const fixtureToTalkMap = createFixtureToTalkMap(fixtures, dataContext);

  fixtureToTalkMap.forEach((talks, fixtureId) => {
    const characterIds = new Set<number>();

    talks.forEach((talk) => {
      if (talk.gameCharacterIds) {
        talk.gameCharacterIds.forEach((charId) => {
          characterIds.add(charId);
        });
      }
    });

    fixtureToCharacterMap.set(fixtureId, Array.from(characterIds));
  });

  return fixtureToCharacterMap;
}

export function createTalkToFixtureMap(
  fixtures: IMysekaiFixtureInfo[],
  dataContext: MysekaiDataContext
): Map<number, IMysekaiFixtureInfo> {
  const talkToFixtureMap = new Map<number, IMysekaiFixtureInfo>();

  if (
    !dataContext.talkConditions ||
    !dataContext.talkConditionGroups ||
    !dataContext.talks
  ) {
    return talkToFixtureMap;
  }

  // Create a fixture lookup map
  const fixtureMap = new Map<number, IMysekaiFixtureInfo>();
  fixtures.forEach((fixture) => {
    fixtureMap.set(fixture.id, fixture);
  });

  // Find all talk conditions that reference fixtures
  const fixtureTalkConditions = dataContext.talkConditions.filter(
    (tc) => tc.mysekaiCharacterTalkConditionType === "mysekai_fixture_id"
  );

  // For each fixture-related condition, map talks to fixtures
  fixtureTalkConditions.forEach((condition) => {
    const fixture = fixtureMap.get(
      condition.mysekaiCharacterTalkConditionTypeValue
    );
    if (!fixture) return;

    // Find condition groups that use this condition
    const conditionGroups = dataContext.talkConditionGroups!.filter(
      (tcg) => tcg.mysekaiCharacterTalkConditionId === condition.id
    );

    // For each condition group, find and map the talks
    conditionGroups.forEach((conditionGroup) => {
      const groupTalks = dataContext.talks!.filter(
        (talk) =>
          talk.mysekaiCharacterTalkConditionGroupId === conditionGroup.groupId
      );

      groupTalks.forEach((talk) => {
        talkToFixtureMap.set(talk.id, fixture);
      });
    });
  });

  return talkToFixtureMap;
}

export function findTalkFixture(
  talkId: number,
  fixtures: IMysekaiFixtureInfo[],
  dataContext: MysekaiDataContext
): IMysekaiFixtureInfo | undefined {
  const talkToFixtureMap = createTalkToFixtureMap(fixtures, dataContext);
  return talkToFixtureMap.get(talkId);
}

export function getFixtureSketchStatus(
  fixture: IMysekaiFixtureInfo,
  data: MysekaiDataContext
): number | undefined {
  if (!data.blueprints?.length) {
    return undefined;
  }

  const blueprint = data.blueprints.find(
    (bp: IMysekaiBlueprint) =>
      bp.mysekaiCraftType === "mysekai_fixture" &&
      bp.craftTargetId === fixture.id
  );

  return blueprint ? (blueprint.isEnableSketch ? 1 : 0) : undefined;
}

export function getFixtureConvertStatus(
  fixture: IMysekaiFixtureInfo,
  data: MysekaiDataContext
): number | undefined {
  if (!data.blueprints?.length) {
    return undefined;
  }

  const blueprint = data.blueprints.find(
    (bp: IMysekaiBlueprint) =>
      bp.mysekaiCraftType === "mysekai_fixture" &&
      bp.craftTargetId === fixture.id
  );

  return blueprint ? (blueprint.isObtainedByConvert ? 1 : 0) : undefined;
}

export function getFixtureBlueprintId(
  fixture: IMysekaiFixtureInfo,
  data: MysekaiDataContext
): number | undefined {
  if (!data.blueprints?.length) {
    return undefined;
  }

  const blueprint = data.blueprints.find(
    (bp: IMysekaiBlueprint) =>
      bp.mysekaiCraftType === "mysekai_fixture" &&
      bp.craftTargetId === fixture.id
  );

  return blueprint?.id;
}

export function getFixtureMaterialCost(
  fixture: IMysekaiFixtureInfo,
  data: MysekaiDataContext
): IMysekaiBlueprintMaterialCost[] | undefined {
  if (!data.materialCosts?.length || !data.blueprints?.length) {
    return undefined;
  }

  const blueprint = data.blueprints.find(
    (bp: IMysekaiBlueprint) =>
      bp.mysekaiCraftType === "mysekai_fixture" &&
      bp.craftTargetId === fixture.id
  );

  if (!blueprint) {
    return undefined;
  }

  const costs = data.materialCosts.filter(
    (cost: IMysekaiBlueprintMaterialCost) =>
      cost.mysekaiBlueprintId === blueprint.id
  );

  return costs.length > 0 ? costs : undefined;
}

export async function getThumbnailURL(
  fixture: IMysekaiFixtureInfo,
  setThumbnailUrl?: (url: string) => void
): Promise<string> {
  const { mysekaiFixtureType, assetbundleName, mysekaiSettableLayoutType } =
    fixture;

  if (mysekaiFixtureType === "surface_appearance") {
    return await getRemoteAssetURL(
      `mysekai/thumbnail/surface_appearance/${assetbundleName}/tex_${assetbundleName}_${mysekaiSettableLayoutType}_1.png`,
      setThumbnailUrl,
      "minio"
    );
  } else {
    return await getRemoteAssetURL(
      `mysekai/thumbnail/fixture/${assetbundleName}_1.webp`,
      setThumbnailUrl,
      "minio"
    );
  }
}
