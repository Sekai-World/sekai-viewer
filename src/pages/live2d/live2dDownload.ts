import Axios from "axios";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { ILive2DModelData, ILive2dModelListElement } from "../../types.d";
import { getModelData } from "../../utils/live2dLoader";

export class Live2DModelDownloadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "Live2DModelDownloadError";
  }
}

interface PackLive2DModelOptions {
  modelItem: ILive2dModelListElement;
  modelName: string;
  onProgress: (progress: number, message: string) => void;
  getMessage: (
    key: string,
    options?: Record<string, string | number>
  ) => string;
}

type MotionFile = ILive2DModelData["FileReferences"]["Motions"]["Motion"][0];

interface PackedModel3Json {
  FileReferences: {
    Moc: string;
    Motions: Record<
      string,
      [
        {
          File: string;
          FadeInTime: number;
          FadeOutTime: number;
        },
      ]
    >;
    Physics: string;
    Textures: string[];
  };
  Groups: ILive2DModelData["Groups"];
  Version: number;
}

function createPackedModel3Json(
  modelName: string,
  modelData: ILive2DModelData
): PackedModel3Json {
  return {
    FileReferences: {
      Moc: `${modelName}.moc3`,
      Motions: [
        ...modelData.FileReferences.Motions.Motion,
        ...modelData.FileReferences.Motions.Expression,
      ].reduce<PackedModel3Json["FileReferences"]["Motions"]>(
        (prev, motion) => {
          prev[motion.Name] = [
            {
              FadeInTime: 0.5,
              FadeOutTime: 0.5,
              File: `motions/${motion.Name}.motion3.json`,
            },
          ];
          return prev;
        },
        {}
      ),
      Physics: `${modelName}.physics3.json`,
      Textures: modelData.FileReferences.Textures.map(
        (_, idx) =>
          `${modelName}.2048/texture_${idx.toString().padStart(2, "0")}.png`
      ),
    },
    Groups: [
      {
        Ids: [],
        Name: "EyeBlink",
        Target: "Parameter",
      },
      {
        Ids: [],
        Name: "LipSync",
        Target: "Parameter",
      },
    ],
    Version: 3,
  };
}

async function getRequiredBlob(url: string, label: string) {
  try {
    const { data } = await Axios.get<Blob>(url, { responseType: "blob" });
    return data;
  } catch (error) {
    throw new Live2DModelDownloadError(`Failed to download ${label}.`, {
      cause: error,
    });
  }
}

async function addRequiredModelFiles(
  zip: JSZip,
  model3: PackedModel3Json,
  modelData: ILive2DModelData,
  onProgress: PackLive2DModelOptions["onProgress"],
  getMessage: PackLive2DModelOptions["getMessage"]
) {
  onProgress(10, getMessage("live2d:pack_progress.download_texture"));
  for (const [
    idx,
    texturePath,
  ] of modelData.FileReferences.Textures.entries()) {
    const texture = await getRequiredBlob(
      modelData.url + texturePath,
      texturePath
    );
    zip.file(model3.FileReferences.Textures[idx], texture);
  }

  onProgress(20, getMessage("live2d:pack_progress.download_moc3"));
  const moc3 = await getRequiredBlob(
    modelData.url + modelData.FileReferences.Moc,
    modelData.FileReferences.Moc
  );
  zip.file(model3.FileReferences.Moc, moc3);

  onProgress(30, getMessage("live2d:pack_progress.download_physics"));
  const physics = await getRequiredBlob(
    modelData.url + modelData.FileReferences.Physics,
    modelData.FileReferences.Physics
  );
  zip.file(model3.FileReferences.Physics, physics);
}

async function addOptionalMotionFile(
  zip: JSZip,
  model3: PackedModel3Json,
  modelData: ILive2DModelData,
  motion: MotionFile
) {
  const { data } = await Axios.get<Blob>(
    new URL(
      motion.File,
      new URL(modelData.url, window.location.href)
    ).toString(),
    { responseType: "blob" }
  );

  zip.file(model3.FileReferences.Motions[motion.Name][0].File, data);
}

async function addOptionalMotionFiles(
  zip: JSZip,
  model3: PackedModel3Json,
  modelData: ILive2DModelData,
  onProgress: PackLive2DModelOptions["onProgress"],
  getMessage: PackLive2DModelOptions["getMessage"]
) {
  const motionFiles = [
    ...modelData.FileReferences.Motions.Motion,
    ...modelData.FileReferences.Motions.Expression,
  ];
  const total = motionFiles.length;
  let count = 0;
  let skipped = 0;

  const updateCount = () => {
    count++;
    onProgress(
      40 + (total > 0 ? Math.round(50 * (count / total)) : 50),
      getMessage("live2d:pack_progress.download_motions", {
        dlcount: count,
        total,
      })
    );
  };

  onProgress(
    40,
    getMessage("live2d:pack_progress.download_motions", {
      dlcount: count,
      total,
    })
  );

  await Promise.all(
    motionFiles.map((motion) =>
      addOptionalMotionFile(zip, model3, modelData, motion)
        .catch((error) => {
          skipped++;
          delete model3.FileReferences.Motions[motion.Name];
          console.warn(`Skip failed Live2D motion: ${motion.Name}`, error);
        })
        .finally(updateCount)
    )
  );

  return skipped;
}

export async function packLive2DModel({
  modelItem,
  modelName,
  onProgress,
  getMessage,
}: PackLive2DModelOptions) {
  onProgress(0, getMessage("live2d:pack_progress.generate_metadata"));

  let modelData: ILive2DModelData;
  try {
    modelData = await getModelData(modelItem);
  } catch (error) {
    throw new Live2DModelDownloadError("Failed to generate model metadata.", {
      cause: error,
    });
  }

  const zip = new JSZip();
  const model3 = createPackedModel3Json(modelName, modelData);

  await addRequiredModelFiles(zip, model3, modelData, onProgress, getMessage);
  const skippedMotions = await addOptionalMotionFiles(
    zip,
    model3,
    modelData,
    onProgress,
    getMessage
  );
  zip.file(`${modelName}.model3.json`, JSON.stringify(model3, null, 2));

  onProgress(90, getMessage("live2d:pack_progress.generate_zip"));
  const content = await zip.generateAsync({ type: "blob" });
  onProgress(100, getMessage("live2d:pack_progress.generate_zip"));
  saveAs(content, `${modelName}.zip`);

  return { skippedMotions };
}
