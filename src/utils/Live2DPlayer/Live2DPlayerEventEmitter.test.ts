import { describe, expect, it, vi } from "vitest";
import { Live2DPlayerEventEmitter } from "./Live2DPlayerEventEmitter";

describe("Live2DPlayerEventEmitter", () => {
  it("dispatches typed warning messages in registration order", () => {
    const emitter = new Live2DPlayerEventEmitter();
    const calls: string[] = [];
    const firstListener = (message: string) => calls.push(`first:${message}`);
    const secondListener = (message: string) => calls.push(`second:${message}`);

    expect(emitter.on("warn", firstListener)).toBe(emitter);
    expect(emitter.on("warn", secondListener)).toBe(emitter);
    expect(emitter.emit("warn", "typed warning")).toBe(true);
    expect(calls).toEqual(["first:typed warning", "second:typed warning"]);
  });

  it("preserves duplicate listeners and removes each matching identity", () => {
    const emitter = new Live2DPlayerEventEmitter();
    const listener = vi.fn((message: string) => message);

    emitter.on("warn", listener).on("warn", listener);
    emitter.emit("warn", "duplicate");
    expect(listener).toHaveBeenCalledTimes(2);

    expect(emitter.off("warn", listener)).toBe(emitter);
    expect(emitter.emit("warn", "after off")).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("reports no listeners before registration and an emptied listener list after off", () => {
    const emitter = new Live2DPlayerEventEmitter();
    const listener = vi.fn((_message: string) => {});

    expect(emitter.emit("warn", "before registration")).toBe(false);
    emitter.on("warn", listener).off("warn", listener);
    expect(emitter.emit("warn", "after removal")).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });
});
