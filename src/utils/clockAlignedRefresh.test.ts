import { CronJob } from "cron";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ClockAlignedRefresh,
  getNextClockAlignedDate,
} from "./clockAlignedRefresh";

const originalTimeZone = process.env.TZ;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  if (originalTimeZone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimeZone;
});

const expectCronEquivalent = (
  expression: string,
  now: Date,
  minuteInterval: number,
  second: number
) => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  const cronDate = new CronJob(expression, () => {}).nextDate().valueOf();
  expect(getNextClockAlignedDate(now, minuteInterval, second).valueOf()).toBe(
    cronDate
  );
};

describe("getNextClockAlignedDate", () => {
  it("matches 6-field cadence at before, exact, and after-second boundaries", () => {
    process.env.TZ = "UTC";
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date("2025-01-01T12:00:09.999Z"),
      3,
      10
    );
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date("2025-01-01T12:00:10.000Z"),
      3,
      10
    );
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date("2025-01-01T12:00:10.001Z"),
      3,
      10
    );
    expect(
      getNextClockAlignedDate(new Date("2025-01-01T12:59:59.999Z"), 3, 10)
    ).toEqual(new Date("2025-01-01T13:00:10.000Z"));
  });

  it("matches 5-field every-30-minute cadence, not a 30-second cadence", () => {
    process.env.TZ = "UTC";
    expectCronEquivalent(
      "*/30 * * * *",
      new Date("2025-01-01T12:29:59.999Z"),
      30,
      0
    );
    expectCronEquivalent(
      "*/30 * * * *",
      new Date("2025-01-01T12:30:00.000Z"),
      30,
      0
    );
    expect(
      getNextClockAlignedDate(new Date("2025-01-01T12:30:01.000Z"), 30, 0)
    ).toEqual(new Date("2025-01-01T13:00:00.000Z"));
  });

  it("matches cron in a non-UTC timezone and over both DST transitions", () => {
    process.env.TZ = "America/New_York";
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date(2025, 0, 1, 12, 0, 9, 999),
      3,
      10
    );
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date(2025, 2, 9, 1, 59, 59, 999),
      3,
      10
    );
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date(2025, 10, 2, 1, 59, 59, 999),
      3,
      10
    );
    expectCronEquivalent(
      "*/30 * * * *",
      new Date(2025, 10, 2, 1, 59, 59, 999),
      30,
      0
    );
    expectCronEquivalent(
      "10 */3 * * * *",
      new Date("2025-11-02T06:00:00.000Z"),
      3,
      10
    );
  });

  it("rejects invalid timer cadence", () => {
    expect(() => getNextClockAlignedDate(Date.now(), 7, 10)).toThrow(
      RangeError
    );
    expect(() => getNextClockAlignedDate(Date.now(), 3, 60)).toThrow(
      RangeError
    );
  });

  it("rejects invalid times and unrepresentable future dates", () => {
    process.env.TZ = "UTC";
    expect(() => getNextClockAlignedDate(Number.NaN, 3, 10)).toThrow(
      RangeError
    );
    expect(() => getNextClockAlignedDate(new Date(Number.NaN), 3, 10)).toThrow(
      RangeError
    );
    expect(() => getNextClockAlignedDate(8.64e15, 3, 0)).toThrow(RangeError);
  });
});

describe("ClockAlignedRefresh", () => {
  it("runs on init before start, binds this, and stops the queued recurrence", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));

    let calls = 0;
    let callbackNextDate: Date | undefined;
    const timer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      runOnInit: true,
      tick: function () {
        calls += 1;
        callbackNextDate = this.nextDate();
        if (calls === 2) this.stop();
      },
    });

    expect(calls).toBe(1);
    expect(callbackNextDate).toBeInstanceOf(Date);
    expect(vi.getTimerCount()).toBe(0);
    timer.start();
    timer.start();
    expect(vi.getTimerCount()).toBe(1);

    const delay = timer.nextDate().getTime() - Date.now();
    vi.advanceTimersByTime(delay);
    expect(calls).toBe(2);
    expect(vi.getTimerCount()).toBe(0);

    timer.stop();
    timer.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("skips missed slots after a late wake and realigns to the wall clock", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
    let calls = 0;
    const timer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: () => {
        calls += 1;
      },
    });

    timer.start();
    const firstTarget = timer.nextDate().getTime();
    const wallClock = vi
      .spyOn(Date, "now")
      .mockReturnValue(firstTarget + 4 * 60_000);
    vi.advanceTimersByTime(
      firstTarget - Date.parse("2025-01-01T12:00:00.000Z")
    );

    expect(calls).toBe(1);
    expect(timer.nextDate()).toEqual(new Date("2025-01-01T12:06:10.000Z"));
    timer.stop();
    wallClock.mockRestore();
  });

  it("does not fire before target after a backward wall-clock jump", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    const start = new Date("2025-01-01T12:00:00.000Z");
    vi.setSystemTime(start);
    const target = start.getTime() + 10_000;
    const wallClock = vi.spyOn(Date, "now").mockReturnValue(target - 5_000);
    let calls = 0;
    const timer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: () => {
        calls += 1;
      },
    });

    timer.start();
    vi.advanceTimersByTime(20_000);
    expect(calls).toBe(0);
    expect(vi.getTimerCount()).toBe(1);

    wallClock.mockReturnValue(target);
    vi.advanceTimersByTime(5_000);
    expect(calls).toBe(1);
    timer.stop();
  });

  it("keeps the next recurrence scheduled when a callback throws", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
    const timer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: () => {
        throw new Error("tick failure");
      },
    });

    timer.start();
    expect(() => vi.advanceTimersByTime(10_000)).toThrow("tick failure");
    expect(vi.getTimerCount()).toBe(1);
    expect(timer.nextDate()).toEqual(new Date("2025-01-01T12:03:10.000Z"));
    timer.stop();
  });

  it("stops at a live deadline without refreshing afterward", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
    const deadline = new Date("2025-01-01T12:00:10.000Z").getTime();
    let refreshes = 0;
    const timer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: function () {
        if (Date.now() >= deadline) this.stop();
        else refreshes += 1;
      },
    });

    timer.start();
    vi.advanceTimersByTime(10_000);

    expect(refreshes).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops old timers on cleanup/reselection and keeps the new selection scheduled", () => {
    process.env.TZ = "UTC";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z"));
    const previousSelection = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: () => {},
    });
    const selectedTimer = new ClockAlignedRefresh({
      minuteInterval: 3,
      second: 10,
      tick: () => {},
    });

    previousSelection.start();
    selectedTimer.start();
    previousSelection.stop();
    expect(vi.getTimerCount()).toBe(1);
    selectedTimer.stop();
    selectedTimer.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
});
