import Axios from "axios";
import { Howl } from "howler";
import { assetUrl } from "../urls";
import { SnippetAction } from "../../types.d";
import type { IScenarioData } from "../../types.d";

import { Live2DAssetTypeImage, Live2DAssetTypeSound } from "./types.d";
import type {
  ILive2DCachedAsset,
  ILive2DAssetUrl,
  ILive2DModelData,
  ILive2DControllerData,
  ILive2DModelDataCollection,
  IProgressEvent,
} from "./types.d";

import { getUIMediaUrls } from "./ui_assets";

import { PreloadQueue } from "./PreloadQueue";

// step 3 - get controller data (preload media)
export async function getLive2DControllerData(
  snData: IScenarioData,
  mediaUrlForLive2D: ILive2DAssetUrl[],
  progress: IProgressEvent
): Promise<ILive2DControllerData> {
  // step 3.1.2 - get live2d player ui urls
  mediaUrlForLive2D.push(...getUIMediaUrls(snData));
  // step 3.2 - preload sound/image
  const scenarioResource = await preloadMedia(mediaUrlForLive2D, progress);
  // step 3.3 - get live2d model data
  const modelData = [];
  const total = snData.AppearCharacters.length;
  let count = 0;
  for (const c of snData.AppearCharacters) {
    count++;
    progress("model_data", count, total, c.CostumeType);
    const md = await getModelData(c.CostumeType);
    modelData.push({
      costume: c.CostumeType,
      cid: c.Character2dId,
      data: md,
      motions: md.FileReferences.Motions.Motion.map((m) => m.Name),
      expressions: md.FileReferences.Motions.Expression.map((e) => e.Name),
    });
  }
  return {
    scenarioData: snData,
    scenarioResource,
    modelData,
  };
}
// step 4 - preload model
export async function preloadModels(
  controllerData: ILive2DControllerData,
  progress: IProgressEvent
) {
  let count = 0;
  const total = controllerData.modelData.length * 3;
  // step 4.1 - preload model assets
  const queue = new PreloadQueue();
  for (const model of controllerData.modelData) {
    await queue.wait();
    await queue.add(
      Axios.get(model.data.url + model.data.FileReferences.Textures[0]),
      () => {
        progress("model_assets", count, total, `${model.costume}/texture`);
        count++;
      }
    );
    await queue.wait();
    await queue.add(
      Axios.get(model.data.url + model.data.FileReferences.Moc),
      () => {
        progress("model_assets", count, total, `${model.costume}/moc`);
        count++;
      }
    );
    await queue.wait();
    await queue.add(
      Axios.get(model.data.url + model.data.FileReferences.Physics),
      () => {
        progress("model_assets", count, total, `${model.costume}/physics`);
        count++;
      }
    );
  }
  await queue.all();
  // step 4.2 - discard useless motions in all model
  controllerData.modelData = discardMotion(
    controllerData.scenarioData,
    controllerData.modelData
  );
  // step 4.3 - preload motions
  await preloadModelMotion(controllerData.modelData, progress);
}

// step 3.2 - preload sound/image
export async function preloadMedia(
  urls: ILive2DAssetUrl[],
  progress: IProgressEvent
): Promise<ILive2DCachedAsset[]> {
  const queue = new PreloadQueue<ILive2DCachedAsset>();
  const total = urls.length;
  let count = 0;
  for (const url of urls) {
    await queue.wait();
    await queue.add(
      new Promise((resolve, reject) => {
        if (Live2DAssetTypeSound.includes(url.type as any)) {
          preloadSound(url.url)
            .then((data) => {
              resolve({ ...url, data });
            })
            .catch(reject);
        } else if (Live2DAssetTypeImage.includes(url.type as any)) {
          preloadImage(url.url)
            .then((data) => {
              resolve({ ...url, data });
            })
            .catch(reject);
        } else {
          resolve({ ...url, data: null });
        }
      }),
      () => {
        count++;
        progress("media", count, total, url.identifer);
      }
    );
  }
  return (await queue.all()).filter((d) => !!d);
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
    });
  });
}
// step 3.3 - get model data
export async function getModelData(
  modelName: string
): Promise<ILive2DModelData> {
  // step 3.3.1 - get model build data
  const { data: modelData } = await Axios.get<{
    Moc3FileName: string;
    TextureNames: string[];
    PhysicsFileName: string;
    UserDataFileName: string;
    AdditionalMotionData: unknown[];
    CategoryRules: unknown[];
  }>(
    `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/buildmodeldata.asset`,
    { responseType: "json" }
  );
  // step 3.3.2 - get motion data
  const motionName = getMotionBaseName(modelName);
  let motionData;
  if (!modelName.startsWith("normal")) {
    const motionRes = await Axios.get<{
      motions: string[];
      expressions: string[];
    }>(
      `${assetUrl.minio.jp}/live2d/motion/${motionName}_rip/BuildMotionData.json`,
      { responseType: "json" }
    );
    motionData = motionRes.data;
  } else {
    motionData = {
      expressions: [],
      motions: [],
    };
  }
  // step 3.3.3 - construct model
  const filename = modelData.Moc3FileName.replace(
    ".moc3.bytes",
    ".model3.json"
  );
  const model3Json = (
    await Axios.get(
      `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/${filename}`
    )
  ).data;
  model3Json.url = `${assetUrl.minio.jp}/live2d/model/${modelName}_rip/`;
  model3Json.FileReferences.Moc = `${model3Json.FileReferences.Moc}.bytes`;
  model3Json.FileReferences.Motions = {
    Motion: motionData.motions.map((elem) => ({
      Name: elem,
      File: `../../motion/${motionName}_rip/${elem}.motion3.json`,
      FadeInTime: 0.5,
      FadeOutTime: 0.1,
    })),
    Expression: motionData.expressions.map((elem) => ({
      Name: elem,
      File: `../../motion/${motionName}_rip/${elem}.motion3.json`,
      FadeInTime: 0.1,
      FadeOutTime: 0.1,
    })),
  };
  model3Json.FileReferences.Expressions = {};
  return model3Json;
}
// step 3.3.2 - get motion data
export function getMotionBaseName(modelName: string): string {
  let motionName = modelName;
  if (!motionName.startsWith("v2_sub") && !motionName.startsWith("sub_rival")) {
    if (motionName.endsWith("_black")) {
      motionName = motionName.slice(0, -6);
    } else if (motionName.endsWith("black")) {
      motionName = motionName.slice(0, -5);
    }
    if (
      motionName?.startsWith("sub") ||
      motionName?.startsWith("clb") ||
      motionName.match(/^v2_\d{2}.*/)
    ) {
      motionName = motionName.split("_").slice(0, 2).join("_");
    } else {
      motionName = motionName.split("_")[0]!;
    }
  } else if (motionName?.startsWith("sub_rival")) {
    motionName = motionName.split("_").slice(0, 3).join("_");
  } else if (motionName?.startsWith("v2_sub_rival")) {
    motionName = motionName.split("_").slice(0, 4).join("_");
  }
  return motionName + "_motion_base";
}

// step 4.2 - discard useless motions in all model
function discardMotion(
  scenarioData: IScenarioData,
  modelData: ILive2DModelDataCollection[]
) {
  const motion_list: {
    costume: string;
    motion: string;
    type: "motion" | "expression";
  }[] = [];
  // gather all motions
  scenarioData.Snippets.forEach((snippet) => {
    switch (snippet.Action) {
      case SnippetAction.CharacterLayout:
      case SnippetAction.CharacterMotion:
        {
          const action = scenarioData.LayoutData[snippet.ReferenceIndex];
          if (action.CostumeType !== "") {
            if (action.MotionName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.MotionName,
                type: "motion",
              });
            }
            if (action.FacialName !== "") {
              motion_list.push({
                costume: action.CostumeType,
                motion: action.FacialName,
                type: "expression",
              });
            }
          } else {
            scenarioData.AppearCharacters.filter(
              (c) => c.Character2dId === action.Character2dId
            ).forEach((a) => {
              if (action.MotionName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: action.MotionName,
                  type: "motion",
                });
              }
              if (action.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: action.FacialName,
                  type: "expression",
                });
              }
            });
          }
        }
        break;
      case SnippetAction.Talk:
        {
          const action = scenarioData.TalkData[snippet.ReferenceIndex];
          if (action.Motions.length > 0) {
            const motion = action.Motions[0];
            scenarioData.AppearCharacters.filter(
              (c) => c.Character2dId === motion.Character2dId
            ).forEach((a) => {
              if (motion.MotionName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: motion.MotionName.replace(" ", ""), // deal with spaces in event_01_02
                  type: "motion",
                });
              }
              if (motion.FacialName !== "") {
                motion_list.push({
                  costume: a.CostumeType,
                  motion: motion.FacialName.replace(" ", ""), // deal with spaces in event_01_02
                  type: "expression",
                });
              }
            });
          }
        }
        break;
    }
  });
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
  // prune
  modelData.forEach((md) => {
    const motion_for_this_model = unique_motion.filter(
      (m) => m.costume === md.costume
    );
    md.motions = motion_for_this_model
      .filter((m) => m.type === "motion")
      .map((m) => m.motion);
    md.data.FileReferences.Motions.Motion = md.motions.map(
      (m) =>
        md.data.FileReferences.Motions.Motion.find((old_m) => old_m.Name === m)!
    );
    md.expressions = motion_for_this_model
      .filter((m) => m.type === "expression")
      .map((m) => m.motion);
    md.data.FileReferences.Motions.Expression = md.expressions.map(
      (m) =>
        md.data.FileReferences.Motions.Expression.find(
          (old_m) => old_m.Name === m
        )!
    );
  });
  return modelData;
}
// step 4.3 - preload motions
async function preloadModelMotion(
  modelData: ILive2DModelDataCollection[],
  progress: IProgressEvent
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
        url: model.data.url + motion.File,
      })),
      ...model.data.FileReferences.Motions.Expression.map((motion) => ({
        origin: `${model.costume}/${motion.Name}`,
        url: model.data.url + motion.File,
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
  const queue = new PreloadQueue<null>();
  for (const motion of unique_motion) {
    await queue.wait();
    await queue.add(Axios.get(motion.url), () => {
      count++;
      progress("model_motion", count, total, motion.origin);
    });
  }
  await queue.all();
}
