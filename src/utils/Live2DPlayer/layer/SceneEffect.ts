import BaseLayer from "./BaseLayer";
import type { ILive2DLayerData } from "../types.d";
import { SeScenarioEffectType } from "../../../types.d";

import { log } from "../log";

import BaseAnimation from "../animation/BaseAnimation";
import Line from "../animation/Line";
import LineLegend from "../animation/LineLegend";
import Kirakira from "../animation/Kirakira";
import Blackout from "../animation/Blackout";
import Lightup from "../animation/Lightup";
import LightupLegend from "../animation/LightupLegend";

export default class SceneEffect extends BaseLayer {
  structure: Record<string, never>;
  scene_effects: { type: string; ani: BaseAnimation }[];

  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
    this.scene_effects = [];
  }

  draw(effect: string) {
    const container = this.root;
    const catagory = Object.entries(SeScenarioEffectType).find(([_, list]) =>
      list.includes(effect)
    );
    if (catagory) {
      let ani: BaseAnimation | undefined = undefined;
      switch (catagory[0]) {
        case "line":
          {
            ani = new Line(0xffffff);
          }
          break;
        case "line_legend":
          {
            let color = 0x000000;
            let color2 = undefined;
            switch (effect) {
              case "line_legend":
                {
                }
                break;
              case "line_legend_02":
                {
                  color = 0xffffff;
                }
                break;
              case "line_legend_02_akito":
                {
                  color = 0xffffff;
                  color2 = 0xff7722;
                }
                break;
              case "line_legend_02_an":
                {
                  color = 0xffffff;
                  color2 = 0x00bbdd;
                }
                break;
              case "line_legend_02_kohane":
                {
                  color = 0xffffff;
                  color2 = 0xff6699;
                }
                break;
              case "line_legend_02_toya":
                {
                  color = 0xffffff;
                  color2 = 0x0077dd;
                }
                break;
            }
            ani = new LineLegend("up", color, color2);
          }
          break;
        case "kirakira":
          {
            let moving_type = "outward";
            switch (effect) {
              case "kirakira_01_still_an":
              case "kirakira_02_still":
                {
                  moving_type = "still";
                }
                break;
              case "kirakira_03":
                {
                  moving_type = "inward";
                }
                break;
            }
            ani = new Kirakira(this.textures, moving_type);
            log.log("SceneEffects", ani);
          }
          break;
        case "black_out":
          {
            let opacity = 0.7;
            switch (effect) {
              case "black_out":
                opacity = 0.7;
                break;
              case "black_out_02":
                opacity = 0.8;
                break;
              case "black_out_03":
                opacity = 0.5;
                break;
              case "black_out_04":
                opacity = 0.6;
                break;
            }
            ani = new Blackout(opacity);
          }
          break;
        case "light_up":
          {
            let light_type = "normal";
            let color = "255, 255, 235";
            switch (effect) {
              case "light_up":
                {
                  light_type = "normal";
                  color = "255, 255, 235";
                }
                break;
              case "light_up_fireworks_01":
                {
                  light_type = "firework";
                  color = "255, 255, 235";
                }
                break;
              case "light_up_fireworks_02":
                {
                  light_type = "firework";
                  color = "235, 235, 255";
                }
                break;
            }
            ani = new Lightup(color, light_type);
          }
          break;
        case "light_up_legend":
          {
            let fog_type = "normal";
            switch (effect) {
              case "light_up_legend_01":
                fog_type = "normal";
                break;
              case "light_up_legend_02":
              case "light_up_legend_03":
                fog_type = "corner";
                break;
            }
            ani = new LightupLegend(this.textures, fog_type);
          }
          break;
        case "dash_line":
          {
            let direction = "left";
            switch (effect) {
              case "dash_line_l":
                direction = "left";
                break;
              case "dash_line_r":
                direction = "right";
                break;
              case "dash_line_down":
                direction = "down";
                break;
              case "dash_line_up":
                direction = "up";
                break;
            }
            ani = new LineLegend(direction, 0xffffff);
          }
          break;
        default:
          log.warn("SceneEffects", `${effect} not implemented!`);
      }
      if (ani) {
        container.addChild(ani.root);
        this.scene_effects.push({
          type: effect,
          ani: ani,
        });
        ani.set_style(this.stage_size);
        ani.start();
      }
    } else {
      log.warn("SceneEffects", `${effect} not implemented!`);
    }
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    this.scene_effects.forEach((e) => e.ani.set_style(this.stage_size));
  }

  remove(effect: string) {
    const idx = this.scene_effects.findIndex((e) => e.type === effect);
    if (idx !== -1) {
      this.scene_effects[idx].ani.destroy();
      this.scene_effects.splice(idx, 1);
    }
  }

  destroy() {
    this.scene_effects.forEach((e) => e.ani.destroy());
    this.scene_effects = [];
  }
}
