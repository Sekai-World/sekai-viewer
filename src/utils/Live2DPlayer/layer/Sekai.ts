import BaseLayer from "./BaseLayer";
import type { ILive2DLayerData } from "../types.d";
import SekaiEffect from "../animation/Sekai";

export default class Sekai extends BaseLayer {
  structure: Record<string, never>;
  sekai?: SekaiEffect;
  constructor(data: ILive2DLayerData) {
    super(data);
    this.structure = {};
  }

  async draw(out = true, time_ms: number) {
    const sekai = new SekaiEffect(this.textures, out, time_ms);
    this.root.addChild(sekai.root);
    this.sekai = sekai;
    sekai.set_style(this.stage_size);
    await sekai.start(this.animation_controller.abort_controller);
  }
  set_style(stage_size?: [number, number]): void {
    this.stage_size = stage_size ? stage_size : this.stage_size;
    if (this.sekai) this.sekai.set_style(this.stage_size);
  }
  destroy() {
    this.sekai?.destroy();
    this.sekai = undefined;
  }
}
