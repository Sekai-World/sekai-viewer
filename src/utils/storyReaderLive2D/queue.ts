/**
 * Simple promise quene for parallel execution for parallel download in sekai.best.
 * @default max_quene_length=5, globally
 * @author K_bai
 */

export class PreloadQuene<T> {
  private max_quene_length = 5;
  private queue: (Promise<{ index: number; r: T }> | number)[] = [];
  private results: T[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.queue = [];
    for (let i = 0; i < this.max_quene_length; i++) this.queue.push(0);
  }

  /**
   * wait for one member to resolve if the queue reached maximum.
   */
  async wait() {
    const clear_queue = this.queue.filter((p) => p !== 0) as Promise<{
      index: number;
      r: T;
    }>[];
    if (clear_queue.length < this.max_quene_length) return;
    const result = await Promise.race(clear_queue);
    this.results.push(result.r);
    this.queue[result.index] = 0;
  }

  /**
   * wait until the queue is not full and add a new task to queue.
   * @param task - task ready to add. Note: task will execute immediately no matter reached limit.
   * @param callback - callback function when task fulfilled.
   */
  async add(task: Promise<T>, callback?: () => void) {
    await this.wait();
    const index = this.queue.findIndex((p) => p === 0);
    this.queue[index] = new Promise((resolve) => {
      task.then((result) => {
        if (callback) callback();
        resolve({
          index: index,
          r: result,
        });
      });
    });
    return;
  }

  /**
   * wait for results for all the tasks added in the queue.
   */
  async all() {
    const clear_queue = this.queue.filter((p) => p !== 0) as Promise<{
      index: number;
      r: T;
    }>[];
    const left_task = await Promise.all(clear_queue);
    this.results.push(...left_task.map((p) => p.r));
    this.init();
    return this.results;
  }
}
