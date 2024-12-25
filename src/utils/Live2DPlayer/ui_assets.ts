import type { ILive2DAssetUrl } from "./types.d";
import { Live2DAssetType } from "./types.d";
import {
  IScenarioData,
  SnippetAction,
  SpecialEffectType,
  SeScenarioEffectType,
} from "../../types.d";
import { assetUrl } from "../urls";

import text_underline from "../../assets/live2d_player_ui/text_underline.svg";
import text_background from "../../assets/live2d_player_ui/text_background.svg";
import black_wipe from "../../assets/live2d_player_ui/black_wipe.svg";

const common = [
  {
    identifer: "ui/text_underline",
    type: Live2DAssetType.UI,
    url: text_underline,
  },
  {
    identifer: "ui/text_background",
    type: Live2DAssetType.UI,
    url: text_background,
  },
  {
    identifer: "ui/black_wipe",
    type: Live2DAssetType.UI,
    url: black_wipe,
  },
];

const condition = {
  sekai: [
    {
      identifer: "ui/tex_scenario_tri_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram_rip/tex_scenario_tri_01.webp`,
    },
  ],
  hologram: [
    {
      identifer: "ui/tex_scenario_tri_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram_rip/tex_scenario_tri_01.webp`,
    },
    {
      identifer: "ui/tex_scenario_kira",
      type: Live2DAssetType.UI,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram_rip/tex_scenario_kira.webp`,
    },
    {
      identifer: "ui/tex_scenario_light",
      type: Live2DAssetType.UI,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram_rip/tex_scenario_light.webp`,
    },
  ],
  kirakira: [
    {
      identifer: "ui/tex_kirakira_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/kirakira_01_rip/tex_kirakira_01.webp`,
    },
  ],
  light_up_legend: [
    {
      identifer: "ui/tex_light_up_legend",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/light_up_legend_01_rip/tex_light_up_legend.webp`,
    },
  ],
};

export function getUIMediaUrls(data: IScenarioData): ILive2DAssetUrl[] {
  const all = [...common];
  const catagory: (keyof typeof condition)[] = [];
  // analyze scenario data, find which is necessary
  data.Snippets.forEach((sn) => {
    if (sn.Action === SnippetAction.SpecialEffect) {
      const sp = data.SpecialEffectData[sn.ReferenceIndex];
      const t = sp.EffectType;
      if (t === SpecialEffectType.SekaiIn) catagory.push("sekai");
      else if (t === SpecialEffectType.SekaiOut) catagory.push("sekai");
      else if (t === SpecialEffectType.AttachCharacterShader)
        catagory.push("hologram");
      else if (t === SpecialEffectType.PlayScenarioEffect) {
        if (SeScenarioEffectType.kirakira.includes(sp.StringVal))
          catagory.push("kirakira");
        else if (SeScenarioEffectType.light_up_legend.includes(sp.StringVal))
          catagory.push("light_up_legend");
      }
    }
  });
  catagory.forEach((c) => {
    condition[c].forEach((i) => {
      const find = all.find((a) => a.identifer === i.identifer);
      if (!find) all.push(i);
    });
  });
  return all;
}
