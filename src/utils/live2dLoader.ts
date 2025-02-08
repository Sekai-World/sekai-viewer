import Axios from "axios";
import { getRemoteAssetURL } from ".";
import type { ILive2DModelData } from "../types.d";

export async function getModelData(
  modelName: string,
  motionFade: [number, number] = [1, 1],
  expressionFade: [number, number] = [1, 1]
): Promise<ILive2DModelData> {
  // step 1 - get model build data
  const { data: modelData } = await Axios.get<{
    Moc3FileName: string;
  }>(await getBuildModelDataUrl(modelName), { responseType: "json" });
  // step 2 - get motion data
  const [motionBaseName, motionData] = await getMotionData(modelName);
  // step 3 - construct model
  const model3Json = (
    await Axios.get(await getModel3JsonUrl(modelName, modelData.Moc3FileName))
  ).data;
  model3Json.url = await getModelBaseUrl(modelName);
  model3Json.FileReferences.Moc = `${model3Json.FileReferences.Moc}.bytes`;
  model3Json.FileReferences.Motions = {
    Motion: motionData.motions.map((elem) => ({
      Name: elem,
      File: getRelativeMotionUrl(motionBaseName, elem),
      FadeInTime: motionFade[0],
      FadeOutTime: motionFade[1],
    })),
    Expression: motionData.expressions.map((elem) => ({
      Name: elem,
      File: getRelativeMotionUrl(motionBaseName, elem),
      FadeInTime: expressionFade[0],
      FadeOutTime: expressionFade[1],
    })),
  };
  model3Json.FileReferences.Expressions = {};
  return model3Json;
}

interface Live2DMotionsExpressions {
  motions: string[];
  expressions: string[];
}

async function getMotionData(
  modelName: string
): Promise<[string, Live2DMotionsExpressions]> {
  let motionData: Live2DMotionsExpressions;
  const [motionDataUrl, motionBaseName] =
    await getBuildMotionDataUrl(modelName);
  if (!modelName.startsWith("normal")) {
    const motionRes = await Axios.get<Live2DMotionsExpressions>(motionDataUrl, {
      responseType: "json",
    });
    motionData = motionRes.data;
  } else {
    motionData = {
      expressions: [],
      motions: [],
    };
  }
  return [motionBaseName, motionData];
}

export async function getBuildModelDataUrl(modelName: string) {
  return await getRemoteAssetURL(
    `live2d/model/${modelName}_rip/buildmodeldata.asset`,
    undefined,
    "minio"
  );
}

type ModelNameTransformer = (modelName: string) => string;

// { [RegExp]: Processor}
const modelNameToMotionBaseName: Record<string, ModelNameTransformer> = {
  // v2_clb\d{2}_(.*) to v2_$1, eg. v2_clb01_21miku to v2_21miku
  "v2_clb\\d{2}_.*": (modelName: string) =>
    modelName.replace(/v2_clb\d{2}_/, "v2_"),
  // (.*)\d{2}$ to $1, eg. 21miku01 to 21miku
  "(.*)\\d{2}$": (modelName: string) => modelName.replace(/\d{2}$/, ""),
};

export async function getBuildMotionDataUrl(
  modelName: string
): Promise<[string, string]> {
  // try to find the correct motion data url
  let modelBaseName = modelName;

  // step 1: get from full name
  let url = await getRemoteAssetURL(
    `live2d/motion/${modelBaseName}_motion_base_rip/BuildMotionData.json`,
    undefined,
    "minio",
    "jp",
    true
  );

  // step 2: check if the motion name is in the map
  if (!url) {
    for (const [pattern, processor] of Object.entries(
      modelNameToMotionBaseName
    )) {
      const regExp = new RegExp(pattern);
      if (regExp.test(modelName)) {
        modelBaseName = processor(modelName);

        // try to get url
        url = await getRemoteAssetURL(
          `live2d/motion/${modelBaseName}_motion_base_rip/BuildMotionData.json`,
          undefined,
          "minio",
          "jp",
          true
        );
        break;
      }
    }
  }

  // step 3: reduce the name until base name
  while (!url && modelBaseName.split("_").length > 1) {
    modelBaseName = modelBaseName.split("_").slice(0, -1).join("_");
    url = await getRemoteAssetURL(
      `live2d/motion/${modelBaseName}_motion_base_rip/BuildMotionData.json`,
      undefined,
      "minio",
      "jp",
      true
    );
  }

  // step 4: if not found, throw error
  if (!url) {
    throw new Error(`Motion data not found for ${modelName}`);
  }

  return [url, modelBaseName + "_motion_base"];
}

async function getModelBaseUrl(modelName: string) {
  return await getRemoteAssetURL(
    `live2d/model/${modelName}_rip/`,
    undefined,
    "minio"
  );
}

async function getModel3JsonUrl(modelName: string, moc3FileName: string) {
  const filename = moc3FileName.replace(".moc3.bytes", ".model3.json");
  return await getRemoteAssetURL(
    `live2d/model/${modelName}_rip/${filename}`,
    undefined,
    "minio"
  );
}

function getRelativeMotionUrl(motionBaseName: string, motion: string) {
  return `../../motion/${motionBaseName}_rip/${motion}.motion3.json`;
}
