import {
  Container,
  Sprite,
  BlurFilter,
  ColorMatrix,
  ColorMatrixFilter,
} from "pixi.js";
import BaseAnimation from "./BaseAnimation";
import { Curve } from "./Curve";
import { texture_slice } from "./utils";
import type { ILive2DTexture } from "../types.d";

/**
 * - hologram: Container
 *   - light1: Container
 *     - light1_s: Sprite
 *   - light2: Container
 *     - light2_s: Sprite
 *   - tri: Container
 *     - tri_s[0]: Sprite
 *     - tri_s[1]: Sprite
 *     - tri_s[2]: Sprite
 *     - tri_s[3]: Sprite
 *     - tri_s[4]: Sprite
 *     - tri_s[5]: Sprite
 *     - tri_s[6]: Sprite
 *     - tri_s[7]: Sprite
 *   - sparkle: Container
 *     - sp_s[0]: Sprite
 *     - sp_s[1]: Sprite
 *     - sp_s[2]: Sprite
 */
export default class Hologram extends BaseAnimation {
  structure: {
    light1_container: Container;
    light1_s: Sprite;
    light2_container: Container;
    light2_s: Sprite;
    tri_container: Container;
    tri_s: Sprite[];
    sparkle_container: Container;
    sp_s: Sprite[];
  };

  constructor(textures: ILive2DTexture[]) {
    super({ textures });
    this.period_ms = 4000;
    const blur = new BlurFilter(1);
    blur.resolution = 2;
    // layer light1
    const light1_container = new Container();
    const light1_s = new Sprite(
      this.textures.find((a) => a.identifer === "ui/hologram_light")!.texture
    );
    //light1_s.filters = [blur];
    light1_container.alpha = 0;
    light1_container.addChild(light1_s);

    // layer light2
    const light2_container = new Container();
    const light2_s = new Sprite(
      this.textures.find((a) => a.identifer === "ui/hologram_light")!.texture
    );
    //light2_s.filters = [blur];
    light2_container.alpha = 0;
    light2_container.addChild(light2_s);

    // layer tri
    const tri_container = new Container();
    const tri_s = texture_slice(
      this.textures.find((a) => a.identifer === "ui/hologram_tri_01")!.texture
        .baseTexture,
      [4, 4],
      10
    )
      .filter((_, idx) => [1, 2, 3, 5, 6, 7, 8, 9].includes(idx))
      .map((t) => new Sprite(t));
    tri_s.forEach((t) => {
      t.alpha = 0;
      tri_container.addChild(t);
    });

    // layer sparkle
    const sparkle_container = new Container();
    const sparkle_texture = this.textures.find(
      (a) => a.identifer === "ui/hologram_kira"
    )!.texture;
    const sp_s = Array.from({ length: 3 }, () => new Sprite(sparkle_texture));
    sp_s.forEach((t) => {
      t.alpha = 1;
      sparkle_container.addChild(t);
    });

    // layer root
    const filter = new ColorMatrixFilter();
    this.root.filters = [filter];
    /*
    R = a*R + b*G + c*B + d*A + e
    G = f*R + g*G + h*B + i*A + j
    B = k*R + l*G + m*B + n*A + o
    A = p*R + q*G + r*B + s*A + t
    */
    const R = [0.9, 0, 0, 0, 0];
    const G = [0, 0.9, 0, 0, 0];
    const B = [0, 0, 1, 0, 0];
    const A = [0, 0, 0, 1, 0];
    filter.matrix = R.concat(G, B, A) as ColorMatrix;
    filter.resolution = 2;
    this.root.addChild(sparkle_container);
    this.root.addChild(tri_container);
    this.root.addChild(light1_container);
    this.root.addChild(light2_container);

    this.structure = {
      light1_container,
      light1_s,
      light2_container,
      light2_s,
      tri_container,
      tri_s,
      sparkle_container,
      sp_s,
    };
    const l1 = new Curve().bounce().ease();
    const l2 = l1.offset(0.5);
    for (let i = 0; i < 100; i++) {
      console.log([i / 100, l2.p(i / 100)]);
    }
  }

  set_style(stage_size: [number, number]) {
    this.stage_size = stage_size;
    this.structure.light1_s.anchor.set(0.5, 1);
    this.structure.light1_s.scale.set(this.em(600) / 256, this.em(600) / 256); // 256: size of the texture
    this.structure.light1_s.position.set(0, this.em(100));
    this.structure.light2_s.anchor.set(0.5, 1);
    this.structure.light2_s.scale.set(this.em(600) / 256, this.em(600) / 256);
    this.structure.light2_s.position.set(0, this.em(100));
    this.structure.tri_s.forEach((s) => {
      s.anchor.set(0.5, 0.5);
      s.scale.set(this.em(this.random(35, 60)) / 128); // 128: size of the texture
    });
    this.structure.sp_s.forEach((s) => {
      s.anchor.set(0.5, 0.5);
      s.scale.set(this.em(this.random(35, 60)) / 256); // 256: size of the texture
    });
  }

  animation(t: number) {
    let l1 = new Curve();
    l1 = l1.bounce();
    let l2 = l1.offset(0.5);
    this.structure.light1_container.alpha = l1.map_range(0, 0.8).p(t);
    this.structure.light2_container.alpha = l2.map_range(0, 0.8).p(t);
    l1 = new Curve();
    l2 = l1.offset(0.5);
    this.structure.light1_container.scale.set(
      l1.map_range(0.9, 1.2).p(t),
      l1.map_range(1, 1.1).p(t)
    );
    this.structure.light2_container.scale.set(
      l2.map_range(0.9, 1.2).p(t),
      l2.map_range(1, 1.1).p(t)
    );

    this.move_sparkle(
      this.structure.tri_s[0],
      t,
      0,
      { from: [-this.em(50), 0], to: [-this.em(170), -this.em(200)] },
      { from: 0, to: 180 }
    );
    this.move_sparkle(
      this.structure.tri_s[1],
      t,
      0.6,
      { from: [-this.em(50), 0], to: [-this.em(200), -this.em(180)] },
      { from: 43, to: 210 }
    );
    this.move_sparkle(
      this.structure.tri_s[2],
      t,
      0.4,
      { from: [-this.em(50), 0], to: [-this.em(230), -this.em(160)] },
      { from: 0, to: 250 }
    );
    this.move_sparkle(
      this.structure.tri_s[3],
      t,
      0.2,
      { from: [this.em(50), 0], to: [this.em(170), -this.em(200)] },
      { from: 100, to: 280 }
    );
    this.move_sparkle(
      this.structure.tri_s[4],
      t,
      0.8,
      { from: [this.em(50), 0], to: [this.em(200), -this.em(180)] },
      { from: 50, to: 290 }
    );
    this.move_sparkle(
      this.structure.tri_s[5],
      t,
      0.3,
      { from: [this.em(50), 0], to: [this.em(230), -this.em(160)] },
      { from: 200, to: 300 }
    );
    this.move_sparkle(
      this.structure.tri_s[6],
      t,
      0.3,
      { from: [-this.em(50), 0], to: [-this.em(150), -this.em(140)] },
      { from: 170, to: 290 }
    );
    this.move_sparkle(
      this.structure.tri_s[7],
      t,
      0.7,
      { from: [this.em(50), 0], to: [this.em(150), -this.em(140)] },
      { from: 0, to: 120 }
    );

    this.move_sparkle(
      this.structure.sp_s[0],
      t,
      0,
      { from: [0, 0], to: [this.em(80), -this.em(140)] },
      { from: 0, to: 120 },
      { from: 0, to: 1 }
    );
    this.move_sparkle(
      this.structure.sp_s[1],
      t,
      0.3,
      { from: [0, 0], to: [-this.em(80), -this.em(140)] },
      { from: 120, to: 240 },
      { from: 0, to: 1 }
    );
    this.move_sparkle(
      this.structure.sp_s[2],
      t,
      0.7,
      { from: [0, 0], to: [this.em(20), -this.em(140)] },
      { from: 240, to: 360 },
      { from: 0, to: 1 }
    );
  }

  private move_sparkle(
    obj: Sprite,
    t: number,
    offset: number,
    position: {
      from: [number, number];
      to: [number, number];
    },
    angle: {
      from: number;
      to: number;
    },
    alpha = {
      from: 0,
      to: 0.4,
    }
  ) {
    const curve = new Curve();
    const c = curve.bounce().offset(offset);
    obj.alpha = c.map_range(alpha.from, alpha.to).p(t);
    const curve2 = new Curve();
    const c2 = curve2.offset(offset);
    obj.x = c2.map_range(position.from[0], position.to[0]).p(t);
    obj.y = c2.map_range(position.from[1], position.to[1]).p(t);
    obj.angle = c2.map_range(angle.from, angle.to).p(t);
  }
}
