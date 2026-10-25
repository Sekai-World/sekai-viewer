// @vitest-environment jsdom

import React, { createRef } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChibiPlayer } from "../../utils/ChibiPlayer/ChibiPlayer";
import ChibiStage from "./ChibiStage";

const chibiMocks = vi.hoisted(() => ({
  app: {},
  constructorCalls: [] as Array<{ app: object; stageSize: [number, number] }>,
  resizeCalls: [] as Array<[number, number]>,
  destroyCalls: 0,
}));

vi.mock("@pixi/react", () => ({
  useApp: () => chibiMocks.app,
}));

vi.mock("../../utils/ChibiPlayer/ChibiPlayer", () => ({
  ChibiPlayer: class {
    constructor(app: object, stageSize: [number, number]) {
      chibiMocks.constructorCalls.push({ app, stageSize });
    }

    setStageSize(stageSize: [number, number]) {
      chibiMocks.resizeCalls.push(stageSize);
    }

    destroy() {
      chibiMocks.destroyCalls += 1;
    }
  },
}));

describe("ChibiStage", () => {
  beforeEach(() => {
    chibiMocks.constructorCalls.length = 0;
    chibiMocks.resizeCalls.length = 0;
    chibiMocks.destroyCalls = 0;
  });

  it("constructs once per mount, resizes the existing player, and destroys it on unmount", () => {
    const ref = createRef<{ player: ChibiPlayer | null }>();
    const initialSize: [number, number] = [640, 480];
    const resizedSize: [number, number] = [800, 600];
    const { rerender, unmount } = render(
      <ChibiStage ref={ref} stageSize={initialSize} />
    );

    rerender(<ChibiStage ref={ref} stageSize={resizedSize} />);

    expect(chibiMocks.constructorCalls).toHaveLength(1);
    expect(chibiMocks.constructorCalls[0].stageSize).toBe(initialSize);
    expect(chibiMocks.resizeCalls).toEqual([resizedSize]);

    unmount();

    expect(chibiMocks.destroyCalls).toBe(1);
  });
});
