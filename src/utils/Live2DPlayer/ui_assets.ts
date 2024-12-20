import type { ILive2DAssetUrl } from "./types.d";
import { Live2DAssetType } from "./types.d";

import text_underline from "../../assets/live2d_player_ui/text_underline.svg";
import text_background from "../../assets/live2d_player_ui/text_background.svg";
import hologram_kira from "../../assets/live2d_player_ui/hologram/tex_scenario_kira.webp";
import hologram_light from "../../assets/live2d_player_ui/hologram/tex_scenario_light.webp";
import hologram_tri_01 from "../../assets/live2d_player_ui/hologram/tex_scenario_tri_01.webp";
import kirakira_01 from "../../assets/live2d_player_ui/kirakira/tex_kirakira_01.webp";
import light_up_legend from "../../assets/live2d_player_ui/light_up_legend/tex_light_up_legend.webp";

export function getUIMediaUrls(): ILive2DAssetUrl[] {
  return [
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
      identifer: "ui/hologram_kira",
      type: Live2DAssetType.UI,
      url: hologram_kira,
    },
    {
      identifer: "ui/hologram_light",
      type: Live2DAssetType.UI,
      url: hologram_light,
    },
    {
      identifer: "ui/hologram_tri_01",
      type: Live2DAssetType.UISheet,
      url: hologram_tri_01,
    },
    {
      identifer: "ui/kirakira_01",
      type: Live2DAssetType.UISheet,
      url: kirakira_01,
    },
    {
      identifer: "ui/light_up_legend",
      type: Live2DAssetType.UISheet,
      url: light_up_legend,
    },
  ];
}
