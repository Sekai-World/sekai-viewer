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
  const motionBaseName = getMotionBaseName(modelName);
  const motionData = await getMotionData(modelName, motionBaseName);
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

function getMotionBaseName(modelName: string): string {
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

async function getMotionData(modelName: string, motionBaseName: string) {
  let motionData;
  if (!modelName.startsWith("normal")) {
    const motionRes = await Axios.get<{
      motions: string[];
      expressions: string[];
    }>(await getBuildMotionDataUrl(motionBaseName), { responseType: "json" });
    motionData = motionRes.data;
  } else {
    motionData = {
      expressions: [],
      motions: [],
    };
  }
  return motionData;
}

async function getBuildModelDataUrl(modelName: string) {
  return await getRemoteAssetURL(
    `live2d/model/${modelName}_rip/buildmodeldata.asset`,
    undefined,
    "minio"
  );
}

async function getBuildMotionDataUrl(motionBaseName: string) {
  return await getRemoteAssetURL(
    `live2d/motion/${motionBaseName}_rip/BuildMotionData.json`,
    undefined,
    "minio"
  );
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
