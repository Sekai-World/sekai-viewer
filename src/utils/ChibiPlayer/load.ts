import { getRemoteAssetURL } from "..";
import { Assets } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v7";
Spine !== undefined; // MAGIC: ensure spine is loading to register assets parser

export const loadChibiAssets = async (spine: string) => {
  const atlasKey = `${spine}_atlas`;
  const skelKey = `${spine}_skel`;
  const path = await getChibiUrl(spine);

  if (!Assets.cache.has(atlasKey))
    Assets.add({
      alias: atlasKey,
      src: path.atlas,
      loadParser: "spineTextureAtlasLoader",
    });
  if (!Assets.cache.has(skelKey))
    Assets.add({ alias: skelKey, src: path.skel, loadParser: "loadJson" });
  const chibiData = await Assets.load([atlasKey, skelKey]);
  return Object.keys(chibiData[skelKey].animations);
};

export const getChibiUrl = async (spine: string) => {
  let basePath;
  let baseSkelPath;
  if (spine.startsWith("sd_mob")) {
    // can't load .skel skeleton files... maybe spine-pixi problem
    basePath = "area_sd/sd_mob";
    baseSkelPath = "area_sd/sd_mob/base_model_mob/sb_mob.skel";
  } else if (spine.startsWith("v2_sd_")) {
    basePath = "area_sd/v2_sd_main";
    baseSkelPath = "area_sd/v2_sd_main/v2_base_model/v2_sd_main.json";
  } else if (spine.startsWith("sd_")) {
    // can't load .skel skeleton files... maybe spine-pixi problem
    basePath = "area_sd/sd_main";
    baseSkelPath = "area_sd/sd_main/base_model/sd_main.skel";
  }
  const atlasPath = await getRemoteAssetURL(
    `${basePath}/${spine}/sekai_atlas.atlas.txt`,
    undefined,
    "minio"
  );
  const skelPath = await getRemoteAssetURL(baseSkelPath!, undefined, "minio");
  return { atlas: atlasPath, skel: skelPath };
};

export const filterValidChibi = (spineList: string[]) => {
  // can only display v2 chibi now
  // sd_mob and sd_main no .json skeleton file available
  // not all chibi files are in costume2ds.json
  return spineList.filter((spine) => spine.startsWith("v2_sd_"));
};
