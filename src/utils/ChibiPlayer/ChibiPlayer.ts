import {
  Container,
  DisplayObject,
  Application,
  FederatedPointerEvent,
} from "pixi.js";
import { Spine, AttachmentTimeline } from "@esotericsoftware/spine-pixi";

import { log } from "../Live2DPlayer/log";

interface IChibiObject {
  id: number;
  spine: string;
  chibi: Spine;
  scale: [number, number];
  rotation: number;
  on: boolean;
}

export class ChibiPlayer {
  app: Application;
  stageSize: [number, number];
  root: Container;
  layers: {
    chibi: Container<Spine>;
  };
  chibiList: IChibiObject[];
  dragTarget: {
    obj: DisplayObject;
    x: number;
    y: number;
  } | null;

  constructor(app: Application, stageSize: [number, number]) {
    // init app
    this.app = app;
    this.dragTarget = null;
    this.stageSize = stageSize;
    this.chibiList = [];

    // add layers
    this.app.stage.removeChildren();
    const root = new Container();
    this.root = root;
    this.app.stage.addChild(root);
    this.layers = {
      chibi: new Container(),
    };
    this.root.addChild(this.layers.chibi);

    // set interaction
    this.root.eventMode = "static";
    this.root.hitArea = app.screen;
    this.root.onpointerup = () => {
      this.onDragEnd();
    };
    this.root.onpointerupoutside = () => {
      this.onDragEnd();
    };

    // set stage size
    this.setStageSize(stageSize);
    log.log("ChibiPlayer", "player init.");
  }

  setStageSize = (stageSize?: [number, number]) => {
    if (stageSize) this.stageSize = stageSize;
    this.chibiList.forEach((c) => {
      const minLength = Math.min(...this.stageSize);
      c.chibi.scale.set(
        (minLength / 2 / 800) * c.scale[0], // assume chibi original size = 800
        (minLength / 2 / 800) * c.scale[1]
      );
      c.chibi.angle = c.rotation;
    });
  };

  initChibi(id: number, spine: string): IChibiObject {
    log.log("ChibiPlayer", `Load spine, id:${id}, ${spine}`);
    const chibi = Spine.from(`${spine}_skel`, `${spine}_atlas`);
    chibi.state.data.defaultMix = 0.2;
    this.layers.chibi.addChild(chibi);
    chibi.x = this.stageSize[0] / 2;
    chibi.y = this.stageSize[1] / 2;
    chibi.eventMode = "static";
    chibi.cursor = "pointer";
    chibi.alpha = 1;
    chibi.onpointerdown = (event: FederatedPointerEvent) => {
      this.onDragStart(event, chibi);
    };
    return {
      id,
      spine,
      chibi,
      scale: [1, 1],
      rotation: 0,
      on: true,
    };
  }

  onDragMove(event: FederatedPointerEvent) {
    if (this.dragTarget) {
      const parent = this.dragTarget.obj.parent;
      const pos = parent.toLocal(event.global);
      this.dragTarget.obj.x = pos.x - this.dragTarget.x;
      this.dragTarget.obj.y = pos.y - this.dragTarget.y;
    }
  }

  onDragStart(event: FederatedPointerEvent, target: DisplayObject) {
    const parent = target.parent;
    const clickPos = parent.toLocal(event.global);
    const offsetX = clickPos.x - target.x;
    const offsetY = clickPos.y - target.y;
    this.dragTarget = {
      obj: target,
      x: offsetX,
      y: offsetY,
    };
    this.dragTarget.obj.alpha = 0.8;
    this.root.onpointermove = (event: FederatedPointerEvent) => {
      this.onDragMove(event);
    };
  }

  onDragEnd() {
    this.root.onpointermove = null;
    if (this.dragTarget) {
      this.dragTarget.obj.alpha = 1;
      this.dragTarget = null;
    }
  }

  updateChibiList(chibiList: { id: number; spine: string }[]) {
    // 1. Remove chibis not in the new list
    const newIds = chibiList.map((c) => c.id);
    // Remove from layers and chibiList
    this.chibiList
      .filter((c) => !newIds.includes(c.id))
      .forEach((c) => {
        log.log("ChibiPlayer", `Remove spine, id:${c.id}, ${c.spine}`);
        this.layers.chibi.removeChild(c.chibi);
        c.chibi.destroy();
      });
    // 2. Add new chibis
    // Build a map for quick lookup
    const oldChibiMap = new Map(this.chibiList.map((c) => [c.id, c]));
    const newChibiList: IChibiObject[] = [];
    for (const { id, spine } of chibiList) {
      const entry = oldChibiMap.get(id);
      if (entry) {
        // Already loaded, reuse
        newChibiList.push({ ...entry });
      } else {
        // Create new chibi
        newChibiList.push(this.initChibi(id, spine));
      }
    }
    // 3. Remove all children and re-add in new order
    this.layers.chibi.removeChildren();
    newChibiList.forEach((c) => this.layers.chibi.addChild(c.chibi));
    // 4. Update chibiList
    this.chibiList = newChibiList;
    this.setStageSize();
  }

  setAnimation(id: number, animation: string) {
    const chibi = this.chibiList.find((c) => c.id === id);
    if (chibi) {
      log.log(
        "ChibiPlayer",
        `Set animation, id:${chibi.id}, ${chibi.spine}, ${animation}`
      );
      chibi.chibi.state.setAnimation(0, animation, true);
    }
  }

  getAnimationList(id: number) {
    const chibi = this.chibiList.find((c) => c.id === id);
    if (chibi)
      return chibi.chibi.state.data.skeletonData.animations.map((a) => a.name);
    return [];
  }

  setTransform(
    id: number,
    transform: { scale: [number, number]; rotation: number }
  ) {
    const chibi = this.chibiList.find((c) => c.id === id);
    if (chibi) {
      log.log(
        "ChibiPlayer",
        `Set transform, id:${chibi.id}, ${chibi.spine}`,
        transform
      );
      chibi.scale = [...transform.scale];
      chibi.rotation = transform.rotation;
      this.setStageSize();
    }
  }

  setDisplay(id: number, on: boolean) {
    const chibi = this.chibiList.find((c) => c.id === id);
    if (chibi) {
      chibi.on = on;
      chibi.chibi.alpha = on ? 1 : 0;
      if (on) {
        chibi.chibi.eventMode = "static";
        chibi.chibi.cursor = "pointer";
      } else {
        chibi.chibi.eventMode = "none";
        chibi.chibi.cursor = "default";
      }
    }
  }

  setShadow(id: number, shadow: boolean) {
    const chibi = this.chibiList.find((c) => c.id === id);
    if (chibi) {
      const skeletonData = chibi.chibi.state.data.skeletonData;
      const shadowSlot = skeletonData.findSlot("shadow");
      if (shadowSlot) {
        // set shadow timeline to all animations
        log.log(
          "ChibiPlayer",
          `Set shadow, id:${chibi.id}, ${chibi.spine}`,
          shadow
        );
        skeletonData.animations.forEach((ani) => {
          const shadowTimeline = ani.timelines.find(
            (tl) =>
              tl instanceof AttachmentTimeline &&
              tl.slotIndex === shadowSlot.index
          ) as AttachmentTimeline | undefined;
          if (shadowTimeline) {
            shadowTimeline.attachmentNames = shadowTimeline.attachmentNames.map(
              (_) => (shadow ? "shadow" : null)
            );
          }
        });
      }
    }
  }

  public destroy() {
    Object.values(this.layers).forEach((l) => l.destroy());
    this.root.destroy();
    log.log("ChibiPlayer", "player destroy.");
  }
}
