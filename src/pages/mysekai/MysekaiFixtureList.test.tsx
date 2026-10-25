// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  IGameChara,
  IMysekaiFixtureGenre,
  IMysekaiFixtureInfo,
  IMysekaiFixtureTag,
  IMysekaiGameCharacterUnitGroups,
  IMysekaiTalk,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
} from "../../types";
import MysekaiFixtureList from "./MysekaiFixtureList";

const fixtureMocks = vi.hoisted(() => ({
  cachedData: new Map<string, unknown>(),
}));

vi.mock("../../utils", async () => {
  const actual =
    await vi.importActual<typeof import("../../utils")>("../../utils");
  return {
    ...actual,
    useCachedData: (name: string) => [
      fixtureMocks.cachedData.get(name),
      false,
      undefined,
    ],
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("./MysekaiFixtureFilter", async () => {
  const ReactModule = await import("react");
  return {
    default: (props: {
      searchQuery: string;
      setSearchQuery: (value: string) => void;
      onApplyFilters: () => void;
    }) =>
      ReactModule.createElement(
        "div",
        null,
        ReactModule.createElement("input", {
          "aria-label": "fixture search",
          value: props.searchQuery,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            props.setSearchQuery(event.target.value),
        }),
        ReactModule.createElement(
          "button",
          { onClick: props.onApplyFilters, type: "button" },
          "Apply fixtures"
        )
      ),
  };
});

vi.mock("../../components/helpers/InfiniteScroll", async () => {
  const ReactModule = await import("react");
  return {
    default: (props: {
      data: IMysekaiFixtureInfo[];
      callback: (
        entries: readonly { isIntersecting: boolean }[],
        setHasMore: (value: boolean) => void
      ) => void;
    }) =>
      ReactModule.createElement(
        ReactModule.Fragment,
        null,
        ReactModule.createElement(
          "ul",
          null,
          props.data.map((fixture) =>
            ReactModule.createElement("li", { key: fixture.id }, fixture.name)
          )
        ),
        ReactModule.createElement(
          "button",
          {
            onClick: () => props.callback([{ isIntersecting: true }], () => {}),
            type: "button",
          },
          "Load more fixtures"
        )
      ),
  };
});

vi.mock("./AgendaView", () => ({ default: () => null }));
vi.mock("./GridView", () => ({ default: () => null }));

function makeFixture(id: number): IMysekaiFixtureInfo {
  return {
    id,
    mysekaiFixtureType: "furniture",
    name: `Fixture ${id}`,
    pronunciation: "",
    flavorText: "",
    seq: id,
    gridSize: { width: 1, depth: 1 },
    mysekaiFixtureMainGenreId: 2,
    mysekaiFixtureSubGenreId: 0,
    mysekaiFixtureHandleType: "",
    mysekaiSettableSiteType: "",
    mysekaiSettableLayoutType: "",
    mysekaiFixturePutType: "",
    mysekaiFixtureAnotherColors: [],
    mysekaiFixturePutSoundId: 0,
    mysekaiFixtureTagGroup: {},
    isAssembled: false,
    isDisassembled: false,
    mysekaiFixturePlayerActionType: "",
    isGameCharacterAction: false,
    assetbundleName: `fixture_${id}`,
  };
}

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

describe("MysekaiFixtureList filtering", () => {
  beforeEach(() => {
    fixtureMocks.cachedData.clear();
    fixtureMocks.cachedData.set(
      "mysekaiFixtures",
      Array.from({ length: 25 }, (_, index) => makeFixture(index + 1))
    );
    fixtureMocks.cachedData.set("mysekaiFixtureMainGenres", [
      { id: 2, name: "Furniture" } satisfies IMysekaiFixtureGenre,
    ]);
    fixtureMocks.cachedData.set("mysekaiFixtureSubGenres", []);
    fixtureMocks.cachedData.set("mysekaiFixtureTags", [
      {
        id: 1,
        name: "Tag",
        pronunciation: "",
        mysekaiFixtureTagType: "test",
        externalId: 1,
      } satisfies IMysekaiFixtureTag,
    ]);
    fixtureMocks.cachedData.set("gameCharacters", [makeChara()]);
    fixtureMocks.cachedData.set("mysekaiBlueprints", []);
    fixtureMocks.cachedData.set("mysekaiBlueprintMysekaiMaterialCosts", []);
    fixtureMocks.cachedData.set("mysekaiCharacterTalkConditions", [
      {
        id: 1,
        mysekaiCharacterTalkConditionType: "test",
        mysekaiCharacterTalkConditionTypeValue: 1,
      } satisfies IMysekaiTalkCondition,
    ]);
    fixtureMocks.cachedData.set("mysekaiCharacterTalkConditionGroups", [
      {
        id: 1,
        groupId: 1,
        mysekaiCharacterTalkConditionId: 1,
      } satisfies IMysekaiTalkConditionGroup,
    ]);
    fixtureMocks.cachedData.set("mysekaiCharacterTalks", [
      {
        id: 1,
        mysekaiCharacterTalkConditionGroupId: 1,
        mysekaiGameCharacterUnitGroupId: 1,
        assetbundleName: "test",
        lua: "test",
      } satisfies IMysekaiTalk,
    ]);
    fixtureMocks.cachedData.set("mysekaiGameCharacterUnitGroups", [
      { id: 1 } satisfies IMysekaiGameCharacterUnitGroups,
    ]);
  });

  it("keeps fixture filtering manual and preserves the current page until apply", async () => {
    render(<MysekaiFixtureList />);

    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(20);
    });
    fireEvent.click(screen.getByText("Load more fixtures"));
    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(25);
    });

    fireEvent.change(screen.getByLabelText("fixture search"), {
      target: { value: "Fixture 25" },
    });

    expect(screen.getAllByRole("listitem")).toHaveLength(25);

    fireEvent.click(screen.getByText("Apply fixtures"));

    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(screen.getByText("Fixture 25")).toBeTruthy();
    });
  });
});
