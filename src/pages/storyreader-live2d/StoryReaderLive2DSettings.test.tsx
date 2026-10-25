// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ILive2DPlayerSettings } from "../../utils/Live2DPlayer/types.d";
import StoryReaderLive2DSettings from "./StoryReaderLive2DSettings";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function createSettings(): ILive2DPlayerSettings {
  return {
    autoplay: true,
    bgmVolume: 50,
    seVolume: 50,
    showUI: true,
    showWarning: true,
    textAnimation: true,
    voiceVolume: 50,
  };
}

describe("StoryReaderLive2DSettings callbacks", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the latest settings callback after the callback prop changes", () => {
    const settings = createSettings();
    const initialCallback = vi.fn();
    const latestCallback = vi.fn();
    const { rerender } = render(
      <StoryReaderLive2DSettings
        settings={settings}
        onSettingsChange={initialCallback}
      />
    );

    rerender(
      <StoryReaderLive2DSettings
        settings={settings}
        onSettingsChange={latestCallback}
      />
    );
    fireEvent.click(screen.getByLabelText("story_reader_live2d:auto_play"));

    expect(initialCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledWith({
      ...settings,
      autoplay: false,
    });
  });
});
