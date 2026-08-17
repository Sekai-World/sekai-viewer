import Axios from "axios";
import { Howl } from "howler";
import type { ILive2dModelListElement, IScenarioData } from "../../types.d";
import { log } from "./log";

import type {
  ILive2DCachedAsset,
  ILive2DAssetUrl,
  ILive2DScenarioResource,
  ILive2DControllerData,
  ILive2DModelDataCollection,
  ILive2DLoadProgressHandler,
  ILive2DLoadWarningHandler,
} from "./types.d";

import {
  isLive2DImageAsset,
  isLive2DAudioAsset,
  isLive2DVideoAsset,
  Live2DLoadProgressType,
} from "./types.d";

import { getUIMediaUrls } from "./ui_assets";
import { PreloadQueue } from "./PreloadQueue";
import { getModelData } from "../live2dLoader";
import { assetUrl } from "../urls";
import { live2dFetch, live2dRequest } from "../index";
import { gatherStoryMotion } from "./motions";

function getAssetFilename(url: string) {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    return decodeURIComponent(pathname.split("/").pop() || url);
  } catch {
    return url.split(/[?#]/, 1)[0].split("/").pop() || url;
  }
}

function getAssetLoadWarning(
  kind: string,
  label: string,
  url: string,
  error: unknown
) {
  const status =
    Axios.isAxiosError(error) && error.response?.status
      ? `: ${error.response.status}`
      : "";
  return `Failed to load ${kind} ${label} (${getAssetFilename(url)})${status}`;
}

// step 3 - get controller data (preload media)
export async function getLive2DControllerData(
  snData: IScenarioData,
  mediaUrlForLive2D: ILive2DAssetUrl[],
  modelDataPromise: Promise<ILive2DModelDataCollection[]>,
  onProgress: ILive2DLoadProgressHandler,
  onWarning: ILive2DLoadWarningHandler
): Promise<ILive2DControllerData> {
  // step 3.1.2 - get live2d player ui urls
  mediaUrlForLive2D.push(...getUIMediaUrls(snData));
  // step 3.2 - preload sound/image
  const [scenarioResource, modelData] = await Promise.all([
    preloadMedia(mediaUrlForLive2D, onProgress, onWarning),
    modelDataPromise,
  ]);
  return {
    scenarioData: snData,
    scenarioResource,
    modelData,
  };
}

export async function getLive2DModelData(
  snData: IScenarioData,
  onProgress: ILive2DLoadProgressHandler
): Promise<ILive2DModelDataCollection[]> {
  // The model list and per-character metadata do not depend on media URLs.
  const total = snData.AppearCharacters.length;
  const modelListPromise: Promise<ILive2dModelListElement[]> = live2dFetch(
    `${assetUrl.minio.live2d}/live2d/model_list.json`
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch model list: ${response.statusText}`);
    }
    return response.json();
  });
  const modelList = await modelListPromise;
  let count = 0;
  const modelDataPromise = Promise.all(
    snData.AppearCharacters.map(async (c) => {
      const modelItem = modelList.find(
        (m: ILive2dModelListElement) => m.modelBase === c.CostumeType
      );
      if (!modelItem) {
        throw new Error(
          `Model not found for ${c.CostumeType} (${c.Character2dId})`
        );
      }
      const md = await getModelData(modelItem, [0.5, 0.1], [0.1, 0.1]);
      count++;
      onProgress(Live2DLoadProgressType.ModelData, count, total, c.CostumeType);
      return {
        costume: c.CostumeType,
        cid: c.Character2dId,
        data: md,
      };
    })
  );
  return await modelDataPromise;
}
// step 4 - preload model
export async function preloadModels(
  controllerData: ILive2DControllerData,
  onProgress: ILive2DLoadProgressHandler,
  onWarning?: ILive2DLoadWarningHandler
) {
  let count = 0;
  const total = controllerData.modelData.length * 3;
  // step 4.1 - preload model assets
  const taskList = [];
  for (const model of controllerData.modelData) {
    const modelAssets = [
      {
        kind: "texture",
        path: model.data.FileReferences.Textures[0],
      },
      {
        kind: "moc",
        path: model.data.FileReferences.Moc,
      },
      {
        kind: "physics",
        path: model.data.FileReferences.Physics,
      },
    ];
    for (const asset of modelAssets) {
      const url = model.data.url + asset.path;
      taskList.push({
        task: () =>
          live2dRequest(() => Axios.get(url)).catch((err) => {
            onWarning?.(
              getAssetLoadWarning(
                asset.kind,
                `${model.costume}/${asset.kind}`,
                url,
                err
              )
            );
            throw err;
          }),
        callback: function () {
          onProgress(
            Live2DLoadProgressType.ModelAssets,
            count,
            total,
            `${model.costume}/${asset.kind}`
          );
          count++;
        },
      });
    }
  }
  const queue = new PreloadQueue(taskList);
  const rst = await queue.run();
  if (rst.filter((r) => r === null).length > 0)
    throw new Error("Asset download failed.");
}

// step 3.2 - preload sound/image/video
export async function preloadMedia(
  urls: ILive2DAssetUrl[],
  onProgress: ILive2DLoadProgressHandler,
  onWarning: ILive2DLoadWarningHandler
): Promise<ILive2DScenarioResource> {
  const total = urls.length;

  // image
  const taskList = [];
  let count = 0;
  for (const url of urls) {
    taskList.push({
      task: async (): Promise<ILive2DCachedAsset> => {
        try {
          if (isLive2DImageAsset(url)) {
            const data = await preloadImage(url.url);
            log.log("Live2DPlayerLoader", `${url.url} loaded.`);
            return { ...url, data };
          } else if (isLive2DVideoAsset(url)) {
            const data = await preloadVideo(url.url);
            log.log("Live2DPlayerLoader", `${url.url} loaded.`);
            return { ...url, data };
          } else if (isLive2DAudioAsset(url)) {
            const data = await preloadSound(url.url);
            log.log("Live2DPlayerLoader", `${url.url} loaded.`);
            return { ...url, data };
          } else {
            throw new Error("Wrong asset type.");
          }
        } catch (err) {
          if (err instanceof Error) onWarning(err.message);
          throw err;
        }
      },
      callback: function () {
        count++;
        onProgress(Live2DLoadProgressType.Media, count, total, url.identifier);
      },
    });
  }
  const queue = new PreloadQueue<ILive2DCachedAsset>(taskList);
  const assetList = (await queue.run()).filter((d) => !!d);
  const scenario_resource: ILive2DScenarioResource = {
    image: assetList.filter((a) => isLive2DImageAsset(a)),
    video: assetList.filter((a) => isLive2DVideoAsset(a)),
    audio: assetList.filter((a) => isLive2DAudioAsset(a)),
  };
  return scenario_resource;
}
function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}
function preloadSound(url: string): Promise<Howl> {
  return new Promise((resolve, reject) => {
    const sound = new Howl({
      src: [url],
      onload: () => resolve(sound),
      onloaderror: () => reject(new Error(`Failed to load sound: ${url}`)),
      loop: false,
      html5: false,
    });
  });
}

function preloadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.onloadeddata = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.src = url;
  });
}

// step 4.2 - discard useless motions in all model
export function discardMotion(
  scenarioData: IScenarioData,
  modelData: ILive2DModelDataCollection[]
) {
  const motion_list = gatherStoryMotion(scenarioData);
  // remove dupulicate
  const unique_motion: typeof motion_list = [];
  motion_list.forEach((m) => {
    if (
      !unique_motion.find(
        (u) =>
          m.costume === u.costume && m.motion === u.motion && m.type === u.type
      )
    ) {
      unique_motion.push(m);
    }
  });
  // console.log(unique_motion);
  // prune
  modelData.forEach((md) => {
    const motion_for_this_model = unique_motion.filter(
      (m) => m.costume === md.costume
    );
    md.data.FileReferences.Motions.Motion = motion_for_this_model
      .filter((m) => m.type === "motion")
      .map((m) =>
        md.data.FileReferences.Motions.Motion.find(
          (all_m) => all_m.Name === m.motion
        )
      )
      .filter((m) => !!m); // skip motions that not in model defination
    md.data.FileReferences.Motions.Expression = motion_for_this_model
      .filter((m) => m.type === "expression")
      .map((m) =>
        md.data.FileReferences.Motions.Expression.find(
          (all_m) => all_m.Name === m.motion
        )
      )
      .filter((m) => !!m); // skip motions that not in model defination
  });
  return modelData;
}
// step 5 - preload motions
export async function preloadModelMotion(
  modelData: ILive2DModelDataCollection[],
  onProgress: ILive2DLoadProgressHandler,
  onWarning: ILive2DLoadWarningHandler
) {
  // gather all motions
  const motion_list: {
    origin: string;
    url: string;
  }[] = [];
  for (const model of modelData) {
    motion_list.push(
      ...model.data.FileReferences.Motions.Motion.map((motion) => ({
        origin: `${model.costume}/${motion.Name}`,
        url: motion.File,
      })),
      ...model.data.FileReferences.Motions.Expression.map((motion) => ({
        origin: `${model.costume}/${motion.Name}`,
        url: motion.File,
      }))
    );
  }
  // remove dupulicate
  const unique_motion: typeof motion_list = [];
  motion_list.forEach((m) => {
    if (!unique_motion.find((u) => m.url === u.url)) {
      unique_motion.push(m);
    }
  });
  // preload by axios
  const total = unique_motion.length;
  let count = 0;
  const taskList = [];
  for (const motion of unique_motion) {
    taskList.push({
      task: () =>
        live2dRequest(() => Axios.get(motion.url)).catch((err) => {
          onWarning(
            getAssetLoadWarning("motion", motion.origin, motion.url, err)
          );
          throw err;
        }),
      callback: function () {
        count++;
        onProgress(
          Live2DLoadProgressType.ModelMotion,
          count,
          total,
          motion.origin
        );
      },
    });
  }
  const queue = new PreloadQueue(taskList);
  await queue.run();
}
