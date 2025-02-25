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
      const abort_handler = () => {
        if (!destroyed) {
          ani_ticker.destroy();
          destroyed = true;
        }
        resolve();
        this.abort_controller.signal.removeEventListener(
          "abort",
          abort_handler
        );
      };
      this.abort_controller.signal.addEventListener("abort", abort_handler);
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
      const abort_handler = () => {
        if (!destroyed) {
          clearTimeout(timeout_id);
          destroyed = true;
        }
        resolve();
        this.abort_controller.signal.removeEventListener(
          "abort",
          abort_handler
        );
      };
      this.abort_controller.signal.addEventListener("abort", abort_handler);
    });
  };
}
