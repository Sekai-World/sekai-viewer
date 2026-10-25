export interface ClockAlignedRefreshOptions {
  minuteInterval: number;
  second: number;
  tick: (this: ClockAlignedRefresh) => void;
  runOnInit?: boolean;
}

const MINUTE_MS = 60_000;
const MAX_REPEATED_HOUR_LOOKBACK_MS = 3 * 60 * MINUTE_MS;

/**
 * Returns the next future local wall-clock minute/second matching the cadence.
 * Stepping through real minutes lets the local Date fields account for DST.
 */
export const getNextClockAlignedDate = (
  now: Date | number,
  minuteInterval: number,
  second: number
): Date => {
  if (
    !Number.isInteger(minuteInterval) ||
    minuteInterval < 1 ||
    minuteInterval > 60 ||
    60 % minuteInterval !== 0
  ) {
    throw new RangeError("minuteInterval must be a positive divisor of 60");
  }
  if (!Number.isInteger(second) || second < 0 || second > 59) {
    throw new RangeError("second must be an integer between 0 and 59");
  }

  const nowMs = typeof now === "number" ? now : now.getTime();
  const nowDate = new Date(nowMs);
  if (Number.isNaN(nowDate.getTime())) {
    throw new RangeError("now must be a valid date");
  }
  let candidateMs = Math.floor(nowMs / MINUTE_MS) * MINUTE_MS + second * 1000;

  while (true) {
    const candidate = new Date(candidateMs);
    if (Number.isNaN(candidate.getTime())) {
      throw new RangeError("no future clock-aligned date is representable");
    }
    if (
      candidateMs > nowMs &&
      candidate.getMinutes() % minuteInterval === 0 &&
      candidate.getSeconds() === second &&
      candidate.getMilliseconds() === 0 &&
      !isSkippedCronFallBackOccurrence(candidate, nowDate)
    ) {
      return candidate;
    }

    candidateMs += MINUTE_MS;
  }
};

/**
 * cron@1.8.3's Luxon field stepping skips the second copy of a repeated local
 * wall-clock time when the first copy has already passed. Keep that behavior
 * rather than emitting an extra refresh during the fall-back hour.
 */
const isSkippedCronFallBackOccurrence = (
  candidate: Date,
  now: Date
): boolean => {
  if (candidate.getTimezoneOffset() === now.getTimezoneOffset()) return false;

  for (
    let lookbackMs = MINUTE_MS;
    lookbackMs <= MAX_REPEATED_HOUR_LOOKBACK_MS;
    lookbackMs += MINUTE_MS
  ) {
    const earlierOccurrence = new Date(candidate.getTime() - lookbackMs);
    if (
      earlierOccurrence.getFullYear() === candidate.getFullYear() &&
      earlierOccurrence.getMonth() === candidate.getMonth() &&
      earlierOccurrence.getDate() === candidate.getDate() &&
      earlierOccurrence.getHours() === candidate.getHours() &&
      earlierOccurrence.getMinutes() === candidate.getMinutes() &&
      earlierOccurrence.getSeconds() === candidate.getSeconds() &&
      earlierOccurrence.getMilliseconds() === candidate.getMilliseconds()
    ) {
      return (
        earlierOccurrence.getTime() <= now.getTime() &&
        earlierOccurrence.getTimezoneOffset() === now.getTimezoneOffset()
      );
    }
  }

  return false;
};

export class ClockAlignedRefresh {
  private readonly minuteInterval: number;
  private readonly second: number;
  private readonly tick: ClockAlignedRefreshOptions["tick"];
  private running = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor({
    minuteInterval,
    second,
    tick,
    runOnInit = false,
  }: ClockAlignedRefreshOptions) {
    // Validate cadence at construction, before the timer is started.
    getNextClockAlignedDate(Date.now(), minuteInterval, second);
    this.minuteInterval = minuteInterval;
    this.second = second;
    this.tick = tick;

    if (runOnInit) this.tick.call(this);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.schedule(this.nextDate());
  }

  stop(): void {
    if (!this.running && this.timer === undefined) return;
    this.running = false;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  nextDate(): Date {
    return getNextClockAlignedDate(
      Date.now(),
      this.minuteInterval,
      this.second
    );
  }

  private schedule(target: Date): void {
    if (!this.running) return;

    const targetMs = target.getTime();
    this.timer = setTimeout(
      () => {
        this.timer = undefined;
        if (!this.running) return;

        if (Date.now() < targetMs) {
          // A backward wall-clock jump woke the native timeout early.
          this.schedule(target);
          return;
        }

        // Match cron's recurrence ordering: queue the next occurrence before
        // calling user code, so a throwing tick does not lose the schedule.
        this.schedule(this.nextDate());
        this.tick.call(this);
      },
      Math.max(0, targetMs - Date.now())
    );
  }
}
