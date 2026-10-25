// @vitest-environment jsdom

import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import Axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  IGameChara,
  IMysekaiGameCharacterUnitGroups,
  IMysekaiTalk,
} from "../../types.d";
import { useLocalStorage } from "../../utils";
import MysekaiTalk from "./MysekaiTalk";

const talkMocks = vi.hoisted(() => ({
  cachedData: new Map<string, unknown>(),
  get: vi.fn(),
}));

vi.mock("../../utils", async () => {
  const actual =
    await vi.importActual<typeof import("../../utils")>("../../utils");
  return {
    ...actual,
    getRemoteAssetURL: async (endpoint: string) => endpoint,
    useCachedData: (name: string) => [
      talkMocks.cachedData.get(name),
      false,
      undefined,
    ],
  };
});

vi.mock("../../stores/root", () => ({
  useRootStore: () => ({ region: "jp" }),
}));

vi.mock("../../utils/i18n", () => ({
  useAssetI18n: () => ({
    getTranslated: (_key: string, fallback: string) => fallback,
  }),
  useCharaName: () => (characterId: number) => `Character ${characterId}`,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("axios", () => ({
  default: { get: talkMocks.get, head: vi.fn() },
}));

function makeChara(): IGameChara {
  return {
    id: 1,
    seq: 1,
    resourceId: 1,
    firstName: "Test",
    givenName: "Character",
    firstNameRuby: "",
    givenNameRuby: "",
    gender: "female",
    height: 160,
    live2dHeightAdjustment: 0,
    figure: "",
    breastSize: "",
    modelName: "test",
    unit: "test",
    supportUnitType: "none",
  };
}

function makeTalks(): IMysekaiTalk[] {
  return Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    mysekaiCharacterTalkConditionGroupId: 1,
    mysekaiGameCharacterUnitGroupId: 1,
    assetbundleName: "test_talk",
    lua: `talk_${index + 1}`,
  }));
}

function TalkHarness() {
  const [revision, setRevision] = useState(0);
  const [, setStableValue] = useLocalStorage<number[]>(
    "talk-filter-harness",
    []
  );

  return (
    <MemoryRouter initialEntries={["/storyreader"]}>
      <Route path="/storyreader">
        <button
          type="button"
          onClick={() => setRevision((current) => current + 1)}
          data-testid="parent-rerender"
        >
          rerender {revision}
        </button>
        <MysekaiTalk onSetStory={() => setStableValue((current) => current)} />
      </Route>
    </MemoryRouter>
  );
}

describe("MysekaiTalk pagination", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "mysekai-talk-character-selected",
      JSON.stringify([1])
    );
    talkMocks.cachedData.clear();
    talkMocks.cachedData.set("mysekaiCharacterTalks", makeTalks());
    talkMocks.cachedData.set("gameCharacters", [makeChara()]);
    talkMocks.cachedData.set("mysekaiGameCharacterUnitGroups", [
      {
        id: 1,
        gameCharacterUnitId1: 1,
      } satisfies IMysekaiGameCharacterUnitGroups,
    ]);
    talkMocks.cachedData.set("unitProfiles", []);
    talkMocks.cachedData.set("mysekaiFixtures", undefined);
    talkMocks.cachedData.set("mysekaiCharacterTalkConditions", undefined);
    talkMocks.cachedData.set("mysekaiCharacterTalkConditionGroups", undefined);
    talkMocks.get.mockResolvedValue({ data: 'text("test dialogue")' });
  });

  it("does not reset page two on an unrelated parent render and keeps filter effects bounded", async () => {
    render(<TalkHarness />);

    await waitFor(() => {
      expect(screen.getAllByLabelText("Go to page 2")).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByLabelText("Go to page 2")[0]);
    await waitFor(() => {
      expect(window.localStorage.getItem("mysekai-talk-current-page")).toBe(
        "2"
      );
    });

    fireEvent.click(screen.getByTestId("parent-rerender"));

    expect(window.localStorage.getItem("mysekai-talk-current-page")).toBe("2");
    expect(
      document.querySelectorAll(".MuiPaginationItem-page.Mui-selected")
    ).toHaveLength(2);
    expect(Axios.get).toHaveBeenCalled();
  });
});
