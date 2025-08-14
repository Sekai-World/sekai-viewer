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
    identifier: "ui/text_underline",
    type: Live2DAssetType.UI,
    url: text_underline,
  },
  {
    identifier: "ui/text_background",
    type: Live2DAssetType.UI,
    url: text_background,
  },
  {
    identifier: "ui/black_wipe",
    type: Live2DAssetType.UI,
    url: black_wipe,
  },
];

const condition = {
  sekai: [
    {
      identifier: "ui/tex_scenario_tri_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram/tex_scenario_tri_01.webp`,
    },
  ],
  hologram: [
    {
      identifier: "ui/tex_scenario_tri_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram/tex_scenario_tri_01.webp`,
    },
    {
      identifier: "ui/tex_scenario_kira",
      type: Live2DAssetType.UI,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram/tex_scenario_kira.webp`,
    },
    {
      identifier: "ui/tex_scenario_light",
      type: Live2DAssetType.UI,
      url: `${assetUrl.minio.jp}/scenario/effect/hologram/tex_scenario_light.webp`,
    },
  ],
  kirakira: [
    {
      identifier: "ui/tex_kirakira_01",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/kirakira_01/tex_kirakira_01.webp`,
    },
  ],
  light_up_legend: [
    {
      identifier: "ui/tex_light_up_legend",
      type: Live2DAssetType.UISheet,
      url: `${assetUrl.minio.jp}/scenario/effect/light_up_legend_01/tex_light_up_legend.webp`,
    },
  ],
};

export function getUIMediaUrls(data: IScenarioData): ILive2DAssetUrl[] {
  const all = [...common];
  const category = new Set<keyof typeof condition>();
  // analyze scenario data, find which is necessary
  data.Snippets.forEach((sn) => {
    if (sn.Action === SnippetAction.SpecialEffect) {
      const sp = data.SpecialEffectData[sn.ReferenceIndex];
      const t = sp.EffectType;
      if (t === SpecialEffectType.SekaiIn) category.add("sekai");
      else if (t === SpecialEffectType.SekaiOut) category.add("sekai");
      else if (t === SpecialEffectType.SekaiInCenter) category.add("sekai");
      else if (t === SpecialEffectType.SekaiOutCenter) category.add("sekai");
      else if (t === SpecialEffectType.AttachCharacterShader)
        category.add("hologram");
      else if (t === SpecialEffectType.PlayScenarioEffect) {
        if (SeScenarioEffectType.kirakira.includes(sp.StringVal))
          category.add("kirakira");
        else if (SeScenarioEffectType.light_up_legend.includes(sp.StringVal))
          category.add("light_up_legend");
      }
    }
  });
  category.forEach((c) => {
    condition[c].forEach((i) => {
      const find = all.find((a) => a.identifier === i.identifier);
      if (!find) all.push(i);
    });
  });
  return all;
}
