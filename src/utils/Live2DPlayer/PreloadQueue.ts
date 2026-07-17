interface ITask<T> {
  task: () => Promise<T>;
  callback?: () => void;
}
/**
 * Simple promise quene for parallel execution for parallel download in sekai.best.
 * @default maxQueueLength=5, globally
 * @author K_bai
 */
export class PreloadQueue<T> {
  private maxQueueLength: number;
  private timeout: number;
  private tasks: ITask<T>[];
  private currentIndex: number;
  private running: number;
  private results: (T | null)[] = [];

  constructor(tasks: ITask<T>[], maxQueueLength = 10, timeout = 60) {
    this.tasks = tasks;
    this.maxQueueLength = maxQueueLength;
    this.timeout = timeout;
    this.currentIndex = 0;
    this.running = 0;
    this.results = new Array(tasks.length).fill(undefined);
  }

  public async run(): Promise<(T | null)[]> {
    return new Promise((resolve) => {
      const runNext = () => {
        if (this.running === 0 && this.currentIndex === this.tasks.length) {
          resolve(this.results);
          return;
        }
        while (
          this.running < this.maxQueueLength &&
          this.currentIndex < this.tasks.length
        ) {
          const taskIndex = this.currentIndex++;
          const task = this.tasks[taskIndex].task;
          const callback = this.tasks[taskIndex].callback;
          this.running++;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`${taskIndex}: Promise timeout.`)),
              this.timeout * 1000
            )
          );
          const promiseToRun = Promise.race([task(), timeoutPromise]);
          promiseToRun
            .then((result) => {
              this.results[taskIndex] = result;
            })
            .catch((error) => {
              console.error(error);
              this.results[taskIndex] = null;
            })
            .finally(() => {
              this.running--;
              if (callback) callback();
              runNext();
            });
        }
      };
      runNext();
    });
  }
}
