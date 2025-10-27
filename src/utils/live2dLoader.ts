import { getRemoteAssetURL } from ".";
import type { ILive2DModelData, ILive2dModelListElement } from "../types.d";

export async function getModelData(
  modelItem: ILive2dModelListElement,
  motionFade: [number, number] = [1, 1],
  expressionFade: [number, number] = [1, 1]
): Promise<ILive2DModelData> {
  // step 1 - get model build data
  const model3Json: ILive2DModelData = await (
    await fetch(await getModel3JsonUrl(modelItem))
  ).json();
  const modelBuildData = await (
    await fetch(await getBuildModelDataUrl(modelItem))
  ).json();
  // step 2 - get motion data
  const [motionBaseName, motionData] = await getMotionData(modelItem);
  const additionalMotionData =
    modelBuildData.AdditionalMotionData.length > 0
      ? await getAddtionalMotionData(modelItem)
      : {
          expressions: [],
          motions: [],
        };
  // step 3 - construct model
  model3Json.url = await getModelBaseUrl(modelItem);
  // model3Json.FileReferences.Moc = `${model3Json.FileReferences.Moc}.bytes`;
  const motions = [];
  for (const elem of motionData.motions) {
    motions.push({
      Name: elem,
      File: await getRelativeMotionUrl(motionBaseName, "motion", elem),
      FadeInTime: motionFade[0],
      FadeOutTime: motionFade[1],
    });
  }

  for (const elem of additionalMotionData.motions) {
    motions.push({
      Name: `${elem}-additional`,
      File: `./motions/${elem}.motion3.json`,
      FadeInTime: motionFade[0],
      FadeOutTime: motionFade[1],
    });
  }

  const expressions = [];
  for (const elem of motionData.expressions) {
    expressions.push({
      Name: elem,
      File: await getRelativeMotionUrl(motionBaseName, "facial", elem),
      FadeInTime: expressionFade[0],
      FadeOutTime: expressionFade[1],
    });
  }

  model3Json.FileReferences.Motions = {
    Motion: motions,
    Expression: expressions,
  };
  model3Json.FileReferences.Expressions = {};
  return model3Json;
}

interface Live2DMotionsExpressions {
  motions: string[];
  expressions: string[];
}

async function getMotionData(
  modelItem: ILive2dModelListElement
): Promise<[string, Live2DMotionsExpressions]> {
  let motionData: Live2DMotionsExpressions;

  // get base motions
  try {
    const [motionDataUrl, motionBaseName] =
      await getBuildMotionDataUrl(modelItem);
    if (!modelItem.modelBase.startsWith("normal")) {
      const response = await fetch(motionDataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch motion data: ${response.statusText}`);
      }
      const motionRes: Live2DMotionsExpressions = await response.json();
      motionData = motionRes;
    } else {
      motionData = {
        expressions: [],
        motions: [],
      };
    }
    return [motionBaseName, motionData];
  } catch (error) {
    console.warn(
      `Error getting motion data for ${modelItem.modelName}: ${error}`
    );
    return ["", { motions: [], expressions: [] }];
  }
}

async function getAddtionalMotionData(modelItem: ILive2dModelListElement) {
  const url = await getRemoteAssetURL(
    `live2d/model/${modelItem.modelPath}/motions/BuildMotionData.json`,
    undefined,
    "minio",
    "live2d",
    true
  );

  if (!url) {
    return {
      expressions: [],
      motions: [],
    };
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch additional motion data: ${response.statusText}`
    );
  }

  const motionRes: Live2DMotionsExpressions = await response.json();

  return motionRes;
}

export async function getBuildModelDataUrl(modelItem: ILive2dModelListElement) {
  return await getRemoteAssetURL(
    `live2d/model/${modelItem.modelPath}/buildmodeldata.asset`,
    undefined,
    "minio",
    "live2d"
  );
}

type ModelNameTransformer = (modelName: string) => string;

// { [RegExp]: Processor}
const modelNameToMotionBaseName: Record<string, ModelNameTransformer> = {
  // eg. v2_clb01_21miku to v2_21miku
  "v2_clb\\d{2}_.*": (modelName: string) =>
    modelName.replace(/v2_clb\d{2}_/, "v2_"),
  // eg. v2_20mizuki_culture_back to v2_20mizuki_back
  "(.*)_back(\\d{2})?$": (modelName: string) => {
    const matches = modelName.match(/(.*)_back(\d{2})?$/);
    if (matches) {
      return `${matches[1].split("_").slice(0, 2).join("_")}_back`;
    } else {
      return modelName;
    }
  },
  // eg. 21miku01 to 21miku
  "(.*)\\d{2}$": (modelName: string) => modelName.replace(/\d{2}$/, ""),
};

export async function getBuildMotionDataUrl(
  modelItem: ILive2dModelListElement
): Promise<[string, string]> {
  // try to find the correct motion data url
  let modelBaseName = modelItem.modelBase;
  let modelDir = modelItem.modelPath.split("/").slice(0, -1).join("/");
  if (modelDir.indexOf("v2/collabo/21_miku") !== -1) {
    modelDir = modelDir.replace("collabo", "main");
  }

  // case 1: get directly from model path + motion_base
  let url = await getRemoteAssetURL(
    `live2d/motion/${modelDir}/${modelBaseName}_motion_base/BuildMotionData.json`,
    undefined,
    "minio",
    "live2d",
    true
  );

  // case 2: check if the motion name is in the map
  if (!url) {
    console.debug(
      `Motion data not found for ${modelItem.modelBase}/${modelItem.modelName}, trying alternative names...`
    );
    for (const [pattern, processor] of Object.entries(
      modelNameToMotionBaseName
    )) {
      const regExp = new RegExp(pattern);
      if (regExp.test(modelItem.modelBase)) {
        modelBaseName = processor(modelItem.modelBase);

        // try to get url
        url = await getRemoteAssetURL(
          `live2d/motion/${modelDir}/${modelBaseName}_motion_base/BuildMotionData.json`,
          undefined,
          "minio",
          "live2d",
          true
        );
        break;
      }
    }
  }

  // case 3: reduce the name until base name
  while (!url && modelBaseName.split("_").length > 1) {
    console.debug(
      `Motion data not found for ${modelItem.modelBase}/${modelItem.modelName} with base name ${modelBaseName}, trying shorter name...`
    );
    modelBaseName = modelBaseName.split("_").slice(0, -1).join("_");
    url = await getRemoteAssetURL(
      `live2d/motion/${modelDir}/${modelBaseName}_motion_base/BuildMotionData.json`,
      undefined,
      "minio",
      "live2d",
      true
    );
  }

  // case 4: if not found, throw error
  if (!url) {
    throw new Error(
      `Motion data not found for ${modelItem.modelBase}/${modelItem.modelName}`
    );
  }

  return [url, `${modelDir}/${modelBaseName}_motion_base`];
}

async function getModelBaseUrl(modelItem: ILive2dModelListElement) {
  return await getRemoteAssetURL(
    `live2d/model/${modelItem.modelPath}/`,
    undefined,
    "minio",
    "live2d"
  );
}

async function getModel3JsonUrl(modelItem: ILive2dModelListElement) {
  return await getRemoteAssetURL(
    `live2d/model/${modelItem.modelPath}/${modelItem.modelFile}`,
    undefined,
    "minio",
    "live2d"
  );
}

async function getRelativeMotionUrl(
  motionBaseName: string,
  motionType: string,
  motion: string
) {
  return await getRemoteAssetURL(
    `live2d/motion/${motionBaseName}/${motionType}/${motion}.motion3.json`,
    undefined,
    "minio",
    "live2d"
  );
}
