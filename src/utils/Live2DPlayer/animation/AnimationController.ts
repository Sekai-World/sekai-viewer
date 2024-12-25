import { Ticker } from "pixi.js";

export default class AnimationController {
  abort_controller: AbortController;

  constructor() {
    this.abort_controller = new AbortController();
  }

  abort = () => {
    this.abort_controller.abort();
  };

  reset_abort = () => {
    if (this.abort_controller.signal.aborted)
      this.abort_controller = new AbortController();
  };

  wrapper = (
    step: (ani_ticker: Ticker) => void,
    finish: (ani_ticker: Ticker) => boolean
  ) => {
    const wait_finish = new Promise<void>((resolve) => {
      let destroyed = false;
      if (this.abort_controller.signal.aborted) {
        resolve();
        return;
      }
      const ani_ticker = new Ticker();
      ani_ticker.add(() => {
        step(ani_ticker);
        if (finish(ani_ticker)) {
          if (!destroyed) {
            ani_ticker.destroy();
            destroyed = true;
          }
          resolve();
        }
      });
      ani_ticker.start();
      this.abort_controller.signal.addEventListener("abort", () => {
        if (!destroyed) {
          ani_ticker.destroy();
          destroyed = true;
        }
        resolve();
      });
    });
    return wait_finish;
  };

  progress_wrapper = async (
    apply: (progress: number) => void,
    time_ms: number
  ) => {
    let progress = 0;
    apply(0);
    await this.wrapper(
      (ani_ticker) => {
        progress = progress + ani_ticker.elapsedMS / time_ms;
        progress = Math.min(progress, 1);
        apply(progress);
      },
      () => progress >= 1
    );
    apply(1);
  };

  delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      let destroyed = false;
      if (this.abort_controller.signal.aborted) {
        resolve();
        return;
      }
      const timeout_id = setTimeout(() => {
        if (!destroyed) {
          destroyed = true;
        }
        resolve();
      }, ms);
      this.abort_controller.signal.addEventListener("abort", () => {
        if (!destroyed) {
          clearTimeout(timeout_id);
          destroyed = true;
        }
        resolve();
      });
    });
  };
}
