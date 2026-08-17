import { getRemoteAssetURL, live2dRequest } from ".";
import type { ILive2DModelData, ILive2dModelListElement } from "../types.d";

type Live2DFileReferenceMotion = {
  Name?: string;
  File?: string;
};

type Live2DFileReferences = ILive2DModelData["FileReferences"] & {
  DisplayInfo?: string;
  Pose?: string;
  Expressions?:
    | Record<string, never>
    | {
        Name?: string;
        File?: string;
      }[];
  Motions?: Record<string, Live2DFileReferenceMotion[]>;
};

interface Live2DBuildModelData {
  AdditionalMotionData: unknown[];
}

function normalizeLive2DAssetPath(path: string) {
  return path.toLowerCase();
}

function getBuildMotionDataPath(basePath: string) {
  return `${basePath}/BuildMotionData.json`;
}

async function getRemoteAssetUrlWithLowercaseFallback(
  endpoint: string,
  verifyStatus = false
) {
  const url = await getRemoteAssetURL(
    endpoint,
    undefined,
    "minio",
    "live2d",
    verifyStatus
  );
  if (url) return url;

  const fallbackEndpoint = normalizeLive2DAssetPath(endpoint);
  if (fallbackEndpoint === endpoint) return "";

  return await getRemoteAssetURL(
    fallbackEndpoint,
    undefined,
    "minio",
    "live2d",
    verifyStatus
  );
}

async function fetchLive2D(url: string) {
  return await live2dRequest(async () => {
    const response = await fetch(url);
    if (response.status === 429) throw response;
    return response;
  });
}

async function fetchJsonWithLowercaseFallback<T>(endpoint: string): Promise<T> {
  const url = await getRemoteAssetUrlWithLowercaseFallback(endpoint);
  const response = await fetchLive2D(url);
  if (response.ok) return await response.json();
  if (response.status !== 404) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  const fallbackEndpoint = normalizeLive2DAssetPath(endpoint);
  if (fallbackEndpoint === endpoint) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  const fallbackUrl =
    await getRemoteAssetUrlWithLowercaseFallback(fallbackEndpoint);
  const fallbackResponse = await fetchLive2D(fallbackUrl);
  if (!fallbackResponse.ok) {
    throw new Error(
      `Failed to fetch ${fallbackEndpoint}: ${fallbackResponse.statusText}`
    );
  }
  return await fallbackResponse.json();
}

async function getExistingRelativeModelAssetPath(
  modelItem: ILive2dModelListElement,
  path: string
) {
  const endpoint = `live2d/model/${modelItem.modelPath}/${path}`;
  const url = await getRemoteAssetUrlWithLowercaseFallback(endpoint, true);
  if (!url) return path;

  return url.endsWith(normalizeLive2DAssetPath(endpoint))
    ? normalizeLive2DAssetPath(path)
    : path;
}

async function applyModelFileReferencesFallback(
  modelItem: ILive2dModelListElement,
  fileReferences: Live2DFileReferences
) {
  fileReferences.Moc = await getExistingRelativeModelAssetPath(
    modelItem,
    fileReferences.Moc
  );
  fileReferences.Physics = await getExistingRelativeModelAssetPath(
    modelItem,
    fileReferences.Physics
  );
  fileReferences.Textures = await Promise.all(
    fileReferences.Textures.map((texture) =>
      getExistingRelativeModelAssetPath(modelItem, texture)
    )
  );

  if (fileReferences.DisplayInfo) {
    fileReferences.DisplayInfo = await getExistingRelativeModelAssetPath(
      modelItem,
      fileReferences.DisplayInfo
    );
  }
  if (fileReferences.Pose) {
    fileReferences.Pose = await getExistingRelativeModelAssetPath(
      modelItem,
      fileReferences.Pose
    );
  }
  if (Array.isArray(fileReferences.Expressions)) {
    await Promise.all(
      fileReferences.Expressions.map(async (expression) => {
        if (expression.File) {
          expression.File = await getExistingRelativeModelAssetPath(
            modelItem,
            expression.File
          );
        }
      })
    );
  }
}

export async function getModelData(
  modelItem: ILive2dModelListElement,
  motionFade: [number, number] = [1, 1],
  expressionFade: [number, number] = [1, 1]
): Promise<ILive2DModelData> {
  // step 1 - get model build data
  const model3JsonPromise = fetchJsonWithLowercaseFallback<ILive2DModelData>(
    `live2d/model/${modelItem.modelPath}/${modelItem.modelFile}`
  );
  const modelBuildDataPromise =
    fetchJsonWithLowercaseFallback<Live2DBuildModelData>(
      `live2d/model/${modelItem.modelPath}/buildmodeldata.asset`
    );
  const motionDataPromise = getMotionData(modelItem);
  const modelBaseUrlPromise = getModelBaseUrl(modelItem);
  const [
    model3Json,
    modelBuildData,
    [motionBaseName, motionData],
    modelBaseUrl,
  ] = await Promise.all([
    model3JsonPromise,
    modelBuildDataPromise,
    motionDataPromise,
    modelBaseUrlPromise,
  ]);

  await applyModelFileReferencesFallback(modelItem, model3Json.FileReferences);
  // step 2 - get motion data
  const additionalMotionData =
    modelBuildData.AdditionalMotionData.length > 0
      ? await getAddtionalMotionData(modelItem)
      : {
          expressions: [],
          motions: [],
        };
  // step 3 - construct model
  model3Json.url = modelBaseUrl;
  // model3Json.FileReferences.Moc = `${model3Json.FileReferences.Moc}.bytes`;
  const motions = await Promise.all(
    motionData.motions.map(async (elem) => ({
      Name: elem,
      File: await getRelativeMotionUrl(motionBaseName, "motion", elem),
      FadeInTime: motionFade[0],
      FadeOutTime: motionFade[1],
    }))
  );

  for (const elem of additionalMotionData.motions) {
    motions.push({
      Name: `${elem}-additional`,
      File: await getExistingRelativeModelAssetPath(
        modelItem,
        `motions/${elem}.motion3.json`
      ),
      FadeInTime: motionFade[0],
      FadeOutTime: motionFade[1],
    });
  }

  const expressions = await Promise.all(
    motionData.expressions.map(async (elem) => ({
      Name: elem,
      File: await getRelativeMotionUrl(motionBaseName, "facial", elem),
      FadeInTime: expressionFade[0],
      FadeOutTime: expressionFade[1],
    }))
  );

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
    if (!normalizeLive2DAssetPath(modelItem.modelBase).startsWith("normal")) {
      const response = await fetchLive2D(motionDataUrl);
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
  const url = await getRemoteAssetUrlWithLowercaseFallback(
    getBuildMotionDataPath(`live2d/model/${modelItem.modelPath}/motions`),
    true
  );

  if (!url) {
    return {
      expressions: [],
      motions: [],
    };
  }

  const response = await fetchLive2D(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch additional motion data: ${response.statusText}`
    );
  }

  const motionRes: Live2DMotionsExpressions = await response.json();

  return motionRes;
}

export async function getBuildModelDataUrl(modelItem: ILive2dModelListElement) {
  return await getRemoteAssetUrlWithLowercaseFallback(
    `live2d/model/${modelItem.modelPath}/buildmodeldata.asset`
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
  if (normalizeLive2DAssetPath(modelDir).indexOf("v2/collabo/21_miku") !== -1) {
    modelDir = modelDir.replace("collabo", "main");
  } else if (
    normalizeLive2DAssetPath(modelDir).indexOf("v2/collabo/egg") !== -1
  ) {
    modelDir = modelDir.split("/").slice(0, -1).join("/");
  }

  // case 1: get directly from model path + motion_base
  let url = await getRemoteAssetUrlWithLowercaseFallback(
    getBuildMotionDataPath(
      `live2d/motion/${modelDir}/${modelBaseName}_motion_base`
    ),
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
      if (regExp.test(modelBaseName)) {
        modelBaseName = processor(modelBaseName);

        // try to get url
        url = await getRemoteAssetUrlWithLowercaseFallback(
          getBuildMotionDataPath(
            `live2d/motion/${modelDir}/${modelBaseName}_motion_base`
          ),
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
    url = await getRemoteAssetUrlWithLowercaseFallback(
      getBuildMotionDataPath(
        `live2d/motion/${modelDir}/${modelBaseName}_motion_base`
      ),
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
  return await getRemoteAssetUrlWithLowercaseFallback(
    `live2d/model/${modelItem.modelPath}/`
  );
}

async function getRelativeMotionUrl(
  motionBaseName: string,
  motionType: string,
  motion: string
) {
  return await getRemoteAssetUrlWithLowercaseFallback(
    `live2d/motion/${motionBaseName}/${motionType}/${motion}.motion3.json`
  );
}
