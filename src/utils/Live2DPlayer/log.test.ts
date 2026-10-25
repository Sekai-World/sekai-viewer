import { afterEach, describe, expect, it, vi } from "vitest";
import { log, LOG_LEVEL } from "./log";

describe("Live2DPlayer logger", () => {
  afterEach(() => {
    log.level = LOG_LEVEL.WARNING;
    vi.restoreAllMocks();
  });

  it("passes arbitrary message values through to the matching console method", () => {
    const message = { detail: "opaque value" };
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    log.level = LOG_LEVEL.VERBOSE;

    log.log("tag", message);
    log.warn("tag", message);
    log.error("tag", message);

    expect(logSpy).toHaveBeenCalledWith("[tag]", message);
    expect(warnSpy).toHaveBeenCalledWith("[tag]", message);
    expect(errorSpy).toHaveBeenCalledWith("[tag]", message);
  });

  it("keeps the existing level filtering", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    log.log("tag", "suppressed");
    log.warn("tag", "visible");
    log.error("tag", "visible");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();
  });
});
