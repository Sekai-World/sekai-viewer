// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { useSnackbar } from "notistack";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAlertSnackbar, useLocalStorage } from "./index";

vi.mock("notistack", () => ({
  useSnackbar: vi.fn(),
}));

const useSnackbarMock = vi.mocked(useSnackbar);

function createSnackbar() {
  return {
    closeSnackbar: vi.fn<ReturnType<typeof useSnackbar>["closeSnackbar"]>(),
    enqueueSnackbar: vi.fn<ReturnType<typeof useSnackbar>["enqueueSnackbar"]>(),
  };
}

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("keeps its setter stable and applies consecutive functional updates to the latest value", () => {
    const { result, rerender } = renderHook(
      ({ initialValue }: { initialValue: number[] }) =>
        useLocalStorage("selected-characters", initialValue),
      { initialProps: { initialValue: [] } }
    );
    const setValue = result.current[1];

    act(() => {
      setValue((current) => [...current, 1]);
      setValue((current) => [...current, 2]);
    });
    rerender({ initialValue: [] });

    expect(result.current[0]).toEqual([1, 2]);
    expect(result.current[1]).toBe(setValue);
    expect(window.localStorage.getItem("selected-characters")).toBe(
      JSON.stringify([1, 2])
    );
  });

  it("keeps the existing non-null fallback for stored and newly written falsy values", () => {
    window.localStorage.setItem("non-null-value", JSON.stringify(null));
    const { result } = renderHook(() =>
      useLocalStorage("non-null-value", 7, false)
    );

    expect(result.current[0]).toBe(7);
    expect(window.localStorage.getItem("non-null-value")).toBe("7");

    act(() => result.current[1](0));

    expect(result.current[0]).toBe(7);
    expect(window.localStorage.getItem("non-null-value")).toBe("7");
  });

  it("accepts functional updates from another realm", () => {
    const { result } = renderHook(() => useLocalStorage("cross-realm", 1));
    const updater: (value: number) => number = runInNewContext(
      "(value) => value + 1"
    );

    expect(updater).not.toBeInstanceOf(Function);
    act(() => result.current[1](updater));

    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem("cross-realm")).toBe("2");
  });
});

describe("useAlertSnackbar", () => {
  it("keeps wrappers stable when the context object changes but its functions do not", () => {
    const snackbar = createSnackbar();
    useSnackbarMock.mockReturnValue(snackbar);

    const { result, rerender } = renderHook(() => useAlertSnackbar());
    const firstResult = result.current;
    useSnackbarMock.mockReturnValue({ ...snackbar });
    rerender();

    expect(result.current).toBe(firstResult);
    expect(result.current.showError).toBe(firstResult.showError);
    expect(result.current.closeSnackbar).toBe(snackbar.closeSnackbar);

    act(() => {
      result.current.showError("load failed", { persist: true });
    });

    expect(snackbar.enqueueSnackbar).toHaveBeenCalledWith("load failed", {
      persist: true,
      variant: "error",
    });
  });
});
