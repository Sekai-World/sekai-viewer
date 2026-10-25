// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MysekaiTalk, SpecialEffect } from "./StoryReaderSnippet";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../../utils/resources", () => ({
  charaIcons: { CharaIcon1: "character-icon.png" },
  chibiIcons: { ChibiIcon1: "chibi-icon.png" },
}));

vi.mock("mui-image", () => ({
  default: (props: { src?: string; alt?: string }) =>
    React.createElement("img", { src: props.src, alt: props.alt }),
}));

vi.mock("../../components/widgets/AudioPlayButton", () => ({
  default: (props: { url: string }) =>
    React.createElement("audio", {
      "data-testid": "audio-play-button",
      "data-url": props.url,
    }),
}));

vi.mock("../../components/blocks/MoviePlayer", () => ({
  default: (props: { path: string; controls: boolean }) =>
    React.createElement("video", {
      "data-testid": "movie-player",
      "data-path": props.path,
      controls: props.controls,
    }),
}));

describe("story reader rendering contracts", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Mysekai dialogue without optional name and voice, without adding audio", () => {
    render(<MysekaiTalk characterId={1} text="A line of dialogue" />);

    expect(screen.getByText("A line of dialogue").textContent).toBe(
      "A line of dialogue"
    );
    expect(screen.queryByTestId("audio-play-button")).toBeNull();
    expect(document.querySelector("img")?.getAttribute("alt")).toBeNull();
  });

  it("renders provided Mysekai name and voice unchanged", () => {
    render(
      <MysekaiTalk
        characterId={1}
        characterName="Ichika"
        text="A voiced line"
        voiceUrl="/voice/ichika.mp3"
      />
    );

    expect(screen.getByText("Ichika").textContent).toBe("Ichika");
    expect(screen.getByText("A voiced line").textContent).toBe("A voiced line");
    expect(document.querySelector("img")?.getAttribute("alt")).toBe("Ichika");
    expect(
      screen.getByTestId("audio-play-button").getAttribute("data-url")
    ).toBe("/voice/ichika.mp3");
  });

  it.each([
    ["FullScreenText", "  full-screen line", "full-screen line"],
    ["Telop", "  telop line", "telop line"],
  ])("trims leading text only for %s effects", (seType, text, expected) => {
    render(<SpecialEffect seType={seType} text={text} resource="" />);

    expect(screen.getByText(expected).textContent).toBe(expected);
  });

  it("keeps background and movie controls when their unused text is undefined", () => {
    render(
      <>
        <SpecialEffect
          seType="ChangeBackground"
          text={undefined}
          resource="/background.png"
        />
        <SpecialEffect seType="Movie" text={undefined} resource="/movie.mp4" />
      </>
    );

    expect(
      screen.getByText("story_reader:snippet.ShowBackground").textContent
    ).toBe("story_reader:snippet.ShowBackground");
    expect(screen.getByText("story_reader:snippet.ShowMovie").textContent).toBe(
      "story_reader:snippet.ShowMovie"
    );
  });

  it.each(["FullScreenText", "Telop"])(
    "preserves the legacy TypeError for %s effects without text",
    (seType) => {
      expect(() =>
        renderToStaticMarkup(
          <SpecialEffect seType={seType} text={undefined} resource="" />
        )
      ).toThrow(TypeError);
    }
  );
});
