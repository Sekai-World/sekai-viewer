interface IQueueMember<T> {
  index: number;
  r: T;
}
/**
 * Simple promise quene for parallel execution for parallel download in sekai.best.
 * @default max_quene_length=5, globally
 * @author K_bai
 */
export class PreloadQueue<T> {
  private max_quene_length: number;
  private timeout: number;
  private queue: (Promise<IQueueMember<T>> | number)[] = [];
  private results: (T | undefined)[] = [];

  constructor(max_quene_length = 5, timeout = 30) {
    this.max_quene_length = max_quene_length;
    this.timeout = timeout;
    this.init();
  }

  private init() {
    this.queue = [];
    for (let i = 0; i < this.max_quene_length; i++) this.queue.push(0);
  }

  /**
   * wait for one member to resolve if the queue reached maximum.
   * @param wait_all - wait for all member to resolve if true. (default: false)
   */
  async wait(wait_all = false) {
    let clear_queue = this.queue.filter((p) => p !== 0) as Promise<
      IQueueMember<T>
    >[];
    while (
      clear_queue.length >= this.max_quene_length ||
      (wait_all && clear_queue.length > 0)
    ) {
      try {
        const result = await Promise.race(clear_queue);
        this.results.push(result.r);
        this.queue[result.index] = 0;
      } catch (result) {
        const r = result as { index: number; err: Error };
        this.results.push(undefined);
        this.queue[r.index] = 0;
        console.error(r.err);
      }
      clear_queue = this.queue.filter((p) => p !== 0) as Promise<
        IQueueMember<T>
      >[];
    }
  }

  /**
   * wait until the queue is not full and add a new task to queue.
   * @param task - task ready to add. Note: task will execute immediately no matter reached limit.
   * @param callback - callback function when task fulfilled.
   */
  async add(task: Promise<T>, callback?: () => void) {
    await this.wait();
    const index = this.queue.findIndex((p) => p === 0);
    this.queue[index] = new Promise((resolve, reject) => {
      let stop = false;
      const timeout_id = setTimeout(() => {
        stop = true;
        reject({ index, err: new Error("Promise timeout.") });
      }, this.timeout * 1000);
      task
        .then((result) => {
          clearTimeout(timeout_id);
          if (stop) reject({ index, err: new Error("Promise timeout.") });
          if (callback) callback();
          resolve({
            index: index,
            r: result,
          });
        })
        .catch((reason) => {
          clearTimeout(timeout_id);
          if (stop) reject({ index, err: new Error("Promise timeout.") });
          if (callback) callback();
          reject({
            index: index,
            err: reason,
          });
        });
    });
    return;
  }

  /**
   * wait for results for all the tasks added in the queue.
   */
  async all() {
    await this.wait(true);
    this.init();
    return this.results;
  }
}
