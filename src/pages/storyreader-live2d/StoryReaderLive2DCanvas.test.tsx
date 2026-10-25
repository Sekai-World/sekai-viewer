// @vitest-environment jsdom

import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IScenarioData } from "../../types.d";
import type {
  ILive2DControllerData,
  ILive2DPlayerSettings,
} from "../../utils/Live2DPlayer/types.d";
import { LoadStatus } from "../../utils/Live2DPlayer/types.d";
import StoryReaderLive2DCanvas from "./StoryReaderLive2DCanvas";

const canvasMocks = vi.hoisted(() => ({
  currentController: {
    animate: { abort: vi.fn(), delay: vi.fn() },
    events: { off: vi.fn(), on: vi.fn() },
    settings: { text_animation: true },
    set_volume: vi.fn(),
    show_ui: vi.fn(),
    step_until_checkpoint: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@pixi/react", async () => {
  const ReactModule = await import("react");
  return {
    Stage: (props: {
      children?: React.ReactNode;
      onClick?: React.MouseEventHandler<HTMLDivElement>;
    }) =>
      ReactModule.createElement(
        "div",
        { "data-testid": "canvas-stage", onClick: props.onClick },
        props.children
      ),
  };
});

vi.mock("../../utils", () => ({
  useAlertSnackbar: () => ({ showError: vi.fn(), showWarning: vi.fn() }),
}));

vi.mock("./StoryReaderLive2DStage", async () => {
  const ReactModule = await import("react");
  const { LoadStatus: Live2DLoadStatus } =
    await import("../../utils/Live2DPlayer/types.d");
  const MockStage = ReactModule.forwardRef<
    unknown,
    {
      onModelLoad: (status: LoadStatus, error?: unknown) => void;
    }
  >((props, ref) => {
    const onModelLoad = ReactModule.useRef(props.onModelLoad);
    ReactModule.useImperativeHandle(
      ref,
      () => ({
        get controller() {
          return canvasMocks.currentController;
        },
        reloadStage: () => {},
      }),
      []
    );
    ReactModule.useEffect(() => {
      onModelLoad.current(Live2DLoadStatus.Loaded);
    }, []);
    return null;
  });

  return { default: MockStage };
});

function createController() {
  return {
    animate: { abort: vi.fn(), delay: vi.fn() },
    events: { off: vi.fn(), on: vi.fn() },
    settings: { text_animation: true },
    set_volume: vi.fn(),
    show_ui: vi.fn(),
    step_until_checkpoint: vi.fn(),
  };
}

function configureController(controller: typeof canvasMocks.currentController) {
  controller.animate.delay.mockImplementation(
    (milliseconds: number) =>
      new Promise<void>((resolve) => {
        const timeout = window.setTimeout(() => {
          pendingDelayCancellations.delete(cancel);
          resolve();
        }, milliseconds);
        const cancel = () => {
          window.clearTimeout(timeout);
          pendingDelayCancellations.delete(cancel);
          resolve();
        };
        pendingDelayCancellations.add(cancel);
      })
  );
  controller.animate.abort.mockImplementation(() => {
    Array.from(pendingDelayCancellations).forEach((cancel) => cancel());
  });
  controller.step_until_checkpoint.mockImplementation((step: number) =>
    Promise.resolve(step + 1)
  );
}

const pendingDelayCancellations = new Set<() => void>();

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

function createSettings(
  overrides: Partial<ILive2DPlayerSettings> = {}
): ILive2DPlayerSettings {
  return {
    autoplay: true,
    bgmVolume: 50,
    seVolume: 50,
    showUI: true,
    showWarning: true,
    textAnimation: true,
    voiceVolume: 50,
    ...overrides,
  };
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("StoryReaderLive2DCanvas autoplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pendingDelayCancellations.clear();
    canvasMocks.currentController = createController();
    configureController(canvasMocks.currentController);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("waits 1500ms for one step and does not restart the delay on unrelated rerenders", async () => {
    const controller = canvasMocks.currentController;
    const settings = createSettings();
    const { rerender } = render(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={settings}
        stageSize={[640, 480]}
      />
    );
    await flushPromises();

    expect(controller.step_until_checkpoint).toHaveBeenCalledTimes(1);
    expect(controller.animate.delay).toHaveBeenCalledTimes(1);
    expect(controller.animate.delay).toHaveBeenCalledWith(1500);

    rerender(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings({ textAnimation: false, showWarning: false })}
        stageSize={[640, 480]}
      />
    );
    expect(controller.animate.delay).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1499);
      await Promise.resolve();
    });
    expect(controller.step_until_checkpoint).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(controller.step_until_checkpoint).toHaveBeenCalledTimes(2);
    expect(controller.animate.delay).toHaveBeenCalledTimes(2);
  });

  it("invalidates a paused delay, resumes with a fresh delay, and preserves manual abort behavior", async () => {
    const controller = canvasMocks.currentController;
    const { rerender, getByTestId } = render(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings()}
        stageSize={[640, 480]}
      />
    );
    await flushPromises();

    rerender(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings({ autoplay: false })}
        stageSize={[640, 480]}
      />
    );
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(controller.step_until_checkpoint).toHaveBeenCalledTimes(1);

    rerender(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings()}
        stageSize={[640, 480]}
      />
    );
    expect(controller.animate.delay).toHaveBeenCalledTimes(2);
    fireEvent.click(getByTestId("canvas-stage"));
    await flushPromises();

    expect(controller.animate.abort).toHaveBeenCalledTimes(1);
    expect(controller.step_until_checkpoint).toHaveBeenCalledTimes(2);
  });

  it("ignores a stale delay after controller replacement and an unmounted delay", async () => {
    const staleController = canvasMocks.currentController;
    const { rerender, unmount } = render(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings()}
        stageSize={[640, 480]}
      />
    );
    await flushPromises();

    const replacementController = createController();
    configureController(replacementController);
    canvasMocks.currentController = replacementController;
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });

    expect(staleController.step_until_checkpoint).toHaveBeenCalledTimes(1);
    expect(replacementController.step_until_checkpoint).not.toHaveBeenCalled();

    canvasMocks.currentController = staleController;
    rerender(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings({ autoplay: false })}
        stageSize={[640, 480]}
      />
    );
    rerender(
      <StoryReaderLive2DCanvas
        controllerData={createControllerData()}
        settings={createSettings()}
        stageSize={[640, 480]}
      />
    );
    await flushPromises();
    unmount();

    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(staleController.step_until_checkpoint).toHaveBeenCalledTimes(1);
  });
});
