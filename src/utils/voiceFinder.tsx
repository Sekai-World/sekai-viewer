import { XMLParser } from "fast-xml-parser";
import { IListBucketResult, ServerRegion } from "../types";
import axios from "axios";
import { assetUrl } from "./urls";

// const errorVoices = {
//   // Master assetBundleName error?
//   "sound/scenario/voice/part_voice_v2_24luka_light_sound_rip/partvoice_20_025.mp3":
//     "sound/scenario/voice/part_voice_v2_24luka_light_sound_rip/partvoice_20_024.mp3"
// }

export const normalizeVoiceName = function (str: string) {
  return str.replace(/_([0-9]{1,3})[abc]_/, "_$1_").replace(/_[abc0-9]$/, "");
};

export const getVoiceListElements = async function (
  acc: Record<string, string>,
  region: ServerRegion,
  pathname: string,
  token?: string
) {
  const parser = new XMLParser({
    isArray: (name) => {
      if (["CommonPrefixes", "Contents"].includes(name)) return true;
      return false;
    },
  });

  const baseURL = assetUrl.minio[region];

  const result = (
    await axios.get<string>(`/`, {
      baseURL,
      params: {
        "continuation-token": token,
        delimiter: "/",
        "list-type": "2",
        "max-keys": "500",
        prefix: pathname,
      },
      responseType: "text",
    })
  ).data;

  const data = parser.parse(result).ListBucketResult as IListBucketResult;
  if (data.Contents) {
    for (const item of data.Contents) {
      const pth = item.Key;
      if (!pth.endsWith(".mp3")) {
        continue;
      }
      const keys = item.Key.replace(".mp3", "")
        .replace(pathname, "")
        .split(";");

      for (let k of keys) {
        k = normalizeVoiceName(k.trim());
        if (k.length > 0 && !acc[k]) {
          acc[k] = item.Key;
        }
      }
    }
  }

  if (data.NextContinuationToken) {
    acc = await getVoiceListElements(
      acc,
      region,
      pathname,
      data.NextContinuationToken
    );
  }

  return acc;
};

export const fixVoiceUrl = async function (
  voiceMap: {
    [key: string]: Record<string, string>;
  },
  region: ServerRegion,
  voiceId: string,
  voiceUrl: string
) {
  const dirUrl = voiceUrl.split("/").slice(0, -1).join("/") + "/";
  let voiceList;
  if (voiceMap[dirUrl]) {
    voiceList = voiceMap[dirUrl];
  } else {
    voiceMap[dirUrl] = await getVoiceListElements({}, region, dirUrl);
    voiceList = voiceMap[dirUrl];
  }
  return voiceList[normalizeVoiceName(voiceId)] || voiceUrl;
};
