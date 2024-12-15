import {
  Container,
  Texture,
  Sprite,
  BlurFilter,
  ColorMatrixFilter,
} from "pixi.js";
import { BaseAnimation } from "./BaseAnimation";
import { map_range, offset, loop, bounce, ease } from "./curve";
import { texture_slice } from "./utils";
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
export class Hologram extends BaseAnimation {
  structure: {
    root_container: Container;
    light1_container: Container;
    light1_s: Sprite;
    light2_container: Container;
    light2_s: Sprite;
    tri_container: Container;
    tri_s: Sprite[];
    sparkle_container: Container;
    sp_s: Sprite[];
  };
  root: Container;

  constructor(
    textures: {
      identifer: string;
      texture: Texture;
    }[]
  ) {
    super();
    const blur = new BlurFilter(1);
    blur.resolution = 2;
    // layer light1
    const light1_container = new Container();
    const light1_s = new Sprite(
      textures.find((a) => a.identifer === "ui/hologram_light")!.texture
    );
    light1_s.filters = [blur];
    light1_container.alpha = 0;
    light1_container.addChild(light1_s);

    // layer light2
    const light2_container = new Container();
    const light2_s = new Sprite(
      textures.find((a) => a.identifer === "ui/hologram_light")!.texture
    );
    light2_s.filters = [blur];
    light2_container.alpha = 0;
    light2_container.addChild(light2_s);

    // layer tri
    const tri_container = new Container();
    const tri_s = texture_slice(
      textures.find((a) => a.identifer === "ui/hologram_tri_01")!.texture
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
    const sparkle_texture = textures.find(
      (a) => a.identifer === "ui/hologram_kira"
    )!.texture;
    const sp_s = Array.from({ length: 3 }, () => new Sprite(sparkle_texture));
    sp_s.forEach((t) => {
      t.alpha = 1;
      sparkle_container.addChild(t);
    });

    // layer root
    const root_container = new Container();
    const filter = new ColorMatrixFilter();
    root_container.filters = [filter];
    /*
    R = a*R + b*G + c*B + d*A + e
    G = f*R + g*G + h*B + i*A + j
    B = k*R + l*G + m*B + n*A + o
    A = p*R + q*G + r*B + s*A + t
    */
    filter.matrix = [
      0.9, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
    ];
    filter.resolution = 2;
    root_container.addChild(sparkle_container);
    root_container.addChild(tri_container);
    root_container.addChild(light1_container);
    root_container.addChild(light2_container);

    this.structure = {
      root_container,
      light1_container,
      light1_s,
      light2_container,
      light2_s,
      tri_container,
      tri_s,
      sparkle_container,
      sp_s,
    };
    this.root = root_container;
  }

  set_style = (stage_size: [number, number]) => {
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
  };

  animation = (p: number) => {
    const l1 = p;
    const l2 = offset(l1, 0.5);
    this.structure.light1_container.alpha = map_range(ease(bounce(l1)), 0, 0.8);
    this.structure.light2_container.alpha = map_range(ease(bounce(l2)), 0, 0.8);
    this.structure.light1_container.scale.set(
      map_range(l1, 0.9, 1.2),
      map_range(l1, 1, 1.1)
    );
    this.structure.light2_container.scale.set(
      map_range(l2, 0.9, 1.2),
      map_range(l2, 1, 1.1)
    );

    this.move_sparkle(
      this.structure.tri_s[0],
      p,
      0,
      { from: [-this.em(50), 0], to: [-this.em(170), -this.em(200)] },
      { from: 0, to: 180 }
    );
    this.move_sparkle(
      this.structure.tri_s[1],
      p,
      0.6,
      { from: [-this.em(50), 0], to: [-this.em(200), -this.em(180)] },
      { from: 43, to: 210 }
    );
    this.move_sparkle(
      this.structure.tri_s[2],
      p,
      0.4,
      { from: [-this.em(50), 0], to: [-this.em(230), -this.em(160)] },
      { from: 0, to: 250 }
    );
    this.move_sparkle(
      this.structure.tri_s[3],
      p,
      0.2,
      { from: [this.em(50), 0], to: [this.em(170), -this.em(200)] },
      { from: 100, to: 280 }
    );
    this.move_sparkle(
      this.structure.tri_s[4],
      p,
      0.8,
      { from: [this.em(50), 0], to: [this.em(200), -this.em(180)] },
      { from: 50, to: 290 }
    );
    this.move_sparkle(
      this.structure.tri_s[5],
      p,
      0.3,
      { from: [this.em(50), 0], to: [this.em(230), -this.em(160)] },
      { from: 200, to: 300 }
    );
    this.move_sparkle(
      this.structure.tri_s[6],
      p,
      0.3,
      { from: [-this.em(50), 0], to: [-this.em(150), -this.em(140)] },
      { from: 170, to: 290 }
    );
    this.move_sparkle(
      this.structure.tri_s[7],
      p,
      0.7,
      { from: [this.em(50), 0], to: [this.em(150), -this.em(140)] },
      { from: 0, to: 120 }
    );

    this.move_sparkle(
      this.structure.sp_s[0],
      p,
      0,
      { from: [0, 0], to: [this.em(80), -this.em(140)] },
      { from: 0, to: 120 },
      { from: 0, to: 1 }
    );
    this.move_sparkle(
      this.structure.sp_s[1],
      p,
      0.3,
      { from: [0, 0], to: [-this.em(80), -this.em(140)] },
      { from: 120, to: 240 },
      { from: 0, to: 1 }
    );
    this.move_sparkle(
      this.structure.sp_s[2],
      p,
      0.7,
      { from: [0, 0], to: [this.em(20), -this.em(140)] },
      { from: 240, to: 360 },
      { from: 0, to: 1 }
    );
  };

  private move_sparkle(
    obj: Sprite,
    progress: number,
    p_offset: number,
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
    const t = offset(loop(progress, 2), p_offset);
    obj.alpha = map_range(ease(bounce(t)), alpha.from, alpha.to);
    obj.x = map_range(t, position.from[0], position.to[0]);
    obj.y = map_range(t, position.from[1], position.to[1]);
    obj.angle = map_range(t, angle.from, angle.to);
  }
}
