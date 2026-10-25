// @vitest-environment jsdom

import React, { createRef } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IScenarioData } from "../../types.d";
import type {
  ILive2DControllerData,
  ILive2DLoadProgressHandler,
} from "../../utils/Live2DPlayer/types.d";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import type { Live2DController } from "../../utils/Live2DPlayer/Live2DController";
import StoryReaderLive2DStage from "./StoryReaderLive2DStage";

const stageMocks = vi.hoisted(() => ({
  app: {},
  constructorCalls: [] as Array<{
    app: object;
    stageSize: [number, number];
    controllerData: unknown;
  }>,
  controllers: [] as Array<{
    clearCalls: number;
    destroyCalls: number;
    loadCalls: number;
    resizeCalls: Array<[number, number]>;
  }>,
  pendingLoads: [] as Array<Promise<void>>,
}));

vi.mock("@pixi/react", () => ({
  useApp: () => stageMocks.app,
}));

vi.mock("../../utils/Live2DPlayer/Live2DController", () => ({
  Live2DController: class {
    private readonly record: (typeof stageMocks.controllers)[number];
    layers: {
      live2d: { load_status: () => string; clear: () => void };
    };
    live2d_load_model: (step: number, onProgress?: unknown) => Promise<void>;

    constructor(
      app: object,
      stageSize: [number, number],
      controllerData: object
    ) {
      stageMocks.constructorCalls.push({ app, stageSize, controllerData });
      this.record = {
        clearCalls: 0,
        destroyCalls: 0,
        loadCalls: 0,
        resizeCalls: [],
      };
      stageMocks.controllers.push(this.record);
      this.layers = {
        live2d: {
          load_status: () => "ready",
          clear: () => {
            this.record.clearCalls += 1;
          },
        },
      };
      this.live2d_load_model = () => {
        this.record.loadCalls += 1;
        return stageMocks.pendingLoads.shift() ?? Promise.resolve();
      };
    }

    set_stage_size(stageSize: [number, number]) {
      this.record.resizeCalls.push(stageSize);
    }

    destroy() {
      this.record.destroyCalls += 1;
    }
  },
}));

function createControllerData(): ILive2DControllerData {
  const scenarioData: IScenarioData = {
    ScenarioId: "test",
    AppearCharacters: [],
    FirstLayout: [],
    FirstBgm: "",
    FirstBackground: "",
    FirstCharacterLayoutMode: 0 as IScenarioData["FirstCharacterLayoutMode"],
    Snippets: [],
    TalkData: [],
    LayoutData: [],
    SpecialEffectData: [],
    SoundData: [],
    NeedBundleNames: [],
    IncludeSoundDataBundleNames: [],
    ScenarioSnippetCharacterLayoutModes: [],
  };

  return {
    scenarioData,
    scenarioResource: { audio: [], image: [], video: [] },
    modelData: [],
  };
}

describe("StoryReaderLive2DStage", () => {
  beforeEach(() => {
    stageMocks.constructorCalls.length = 0;
    stageMocks.controllers.length = 0;
    stageMocks.pendingLoads.length = 0;
  });

  it("reloads with current props, ignores stale loading, and destroys only the active controller on unmount", async () => {
    let resolveInitialLoad!: () => void;
    let resolveReloadLoad!: () => void;
    const initialLoad = new Promise<void>((resolve) => {
      resolveInitialLoad = resolve;
    });
    const reloadLoad = new Promise<void>((resolve) => {
      resolveReloadLoad = resolve;
    });
    stageMocks.pendingLoads.push(initialLoad, reloadLoad);

    const initialControllerData = createControllerData();
    const latestControllerData = createControllerData();
    const initialSize: [number, number] = [640, 480];
    const latestSize: [number, number] = [800, 600];
    const initialOnModelLoad =
      vi.fn<(status: LoadStatus, error?: unknown) => void>();
    const latestOnModelLoad =
      vi.fn<(status: LoadStatus, error?: unknown) => void>();
    const onRenderProgress: ILive2DLoadProgressHandler = vi.fn();
    const ref = createRef<{
      readonly controller?: Live2DController;
      reloadStage: () => void;
    }>();

    const { rerender, unmount } = render(
      <StoryReaderLive2DStage
        ref={ref}
        stageSize={initialSize}
        controllerData={initialControllerData}
        onModelLoad={initialOnModelLoad}
        onRenderProgress={onRenderProgress}
      />
    );

    rerender(
      <StoryReaderLive2DStage
        ref={ref}
        stageSize={latestSize}
        controllerData={latestControllerData}
        onModelLoad={latestOnModelLoad}
        onRenderProgress={onRenderProgress}
      />
    );
    expect(stageMocks.constructorCalls).toHaveLength(1);
    expect(stageMocks.controllers[0].resizeCalls).toEqual([latestSize]);

    act(() => ref.current?.reloadStage());

    expect(stageMocks.constructorCalls).toHaveLength(2);
    expect(stageMocks.constructorCalls[1]).toEqual({
      app: stageMocks.app,
      stageSize: latestSize,
      controllerData: latestControllerData,
    });
    expect(stageMocks.controllers[0].destroyCalls).toBe(1);
    expect(latestOnModelLoad).toHaveBeenCalledWith(LoadStatus.Loading);

    await act(async () => {
      resolveInitialLoad();
      await initialLoad;
    });

    expect(initialOnModelLoad).toHaveBeenCalledTimes(1);
    expect(initialOnModelLoad).toHaveBeenCalledWith(LoadStatus.Loading);

    await act(async () => {
      resolveReloadLoad();
      await reloadLoad;
    });

    expect(latestOnModelLoad).toHaveBeenLastCalledWith(LoadStatus.Loaded);

    unmount();

    expect(stageMocks.controllers[0].destroyCalls).toBe(1);
    expect(stageMocks.controllers[1].destroyCalls).toBe(1);
  });
});
