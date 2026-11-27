import type { ServerRegion } from "../../types.d";

const KR_EXCLUSIVE_IDS = [
  10001, 10002, 371, 387, 419, 420, 453, 459, 464, 10003, 10004, 10005, 10006,
  10007, 10008, 694, 10009, 10010, 11013,
];
const EN_EXCLUSIVE_IDS = [
  371, 387, 419, 420, 445, 453, 459, 464, 479, 502, 514, 528, 535, 552, 563,
  568, 598, 599, 602, 609, 640, 657, 673, 690, 694, 701, 725, 736, 762, 786,
  787, 807,
];
const TW_EXCLUSIVE_IDS = [371, 387, 419, 420, 453, 459, 464, 694, 11012];
const CN_EXCLUSIVE_IDS = [
  76, 276, 371, 376, 387, 419, 420, 453, 464, 476, 576, 798, 799, 800, 801,
  10001, 10002, 11001, 11002, 11003, 11004, 11005, 11006, 11007, 11008, 11009,
  11010, 11011, 11012, 11013, 11014, 11015, 11016, 11017, 11018, 11019,
];

export function isExclusiveMusic(musicId: number, region: ServerRegion) {
  switch (region) {
    case "kr":
      return KR_EXCLUSIVE_IDS.includes(musicId);
    case "en":
      return EN_EXCLUSIVE_IDS.includes(musicId);
    case "tw":
      return TW_EXCLUSIVE_IDS.includes(musicId);
    case "cn":
      return CN_EXCLUSIVE_IDS.includes(musicId);
    default:
      return false;
  }
}

export function getMusicJacketAsset(
  musicId: number,
  assetbundleName: string,
  musicVocalType: string | undefined,
  region: ServerRegion
) {
  const originalVocalSuffix =
    musicId === 19 && musicVocalType?.includes("original") ? "_org" : "";

  return {
    path: `music/jacket/${assetbundleName}/${assetbundleName}${originalVocalSuffix}.webp`,
    region: isExclusiveMusic(musicId, region) ? region : "jp",
  };
}
