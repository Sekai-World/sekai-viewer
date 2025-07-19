import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  Badge,
  Container,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
  Sort,
  SortOutlined,
  ViewAgenda,
  ViewAgendaOutlined,
  GridView as ViewGrid,
  GridViewOutlined as ViewGridOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";

import {
  IMysekaiFixtureInfo,
  IMysekaiFixtureGenre,
  IMysekaiFixtureTag,
  IGameChara,
  IMysekaiBlueprint,
  IMysekaiBlueprintMaterialCost,
  IMysekaiTalkCondition,
  IMysekaiTalkConditionGroup,
  IMysekaiTalk,
  IMysekaiGameCharacterUnitGroups,
  MysekaiDataContext,
} from "../../types";
import { useCachedData, useToggle, useLocalStorage } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import AgendaView from "./AgendaView";
import GridView from "./GridView";
import MysekaiFixtureFilter from "./MysekaiFixtureFilter";
import {
  getFixtureSketchStatus,
  getFixtureConvertStatus,
  charaMap,
  createFixtureToCharacterMap,
} from "../../utils/mysekaiFixtureUtils";

export type MysekaiFixtureViewGridType = "grid" | "agenda";

function getPaginatedFixtures(
  fixtures: IMysekaiFixtureInfo[],
  page: number,
  limit: number
) {
  return fixtures.slice(limit * (page - 1), limit * page);
}

const MysekaiFixtureList: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();

  useLayoutEffect(() => {
    document.title = t("title:mysekaiFixtureList");
  }, [t]);

  const [fixturesCache] = useCachedData<IMysekaiFixtureInfo>("mysekaiFixtures");
  const [genres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureMainGenres"
  );
  const [subGenres] = useCachedData<IMysekaiFixtureGenre>(
    "mysekaiFixtureSubGenres"
  );
  const [tags] = useCachedData<IMysekaiFixtureTag>("mysekaiFixtureTags");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");

  // Additional data needed for computed fields
  const [blueprints] = useCachedData<IMysekaiBlueprint>("mysekaiBlueprints");
  const [materialCosts] = useCachedData<IMysekaiBlueprintMaterialCost>(
    "mysekaiBlueprintMysekaiMaterialCosts"
  );
  const [talkConditions] = useCachedData<IMysekaiTalkCondition>(
    "mysekaiCharacterTalkConditions"
  );
  const [talkConditionGroups] = useCachedData<IMysekaiTalkConditionGroup>(
    "mysekaiCharacterTalkConditionGroups"
  );
  const [talks] = useCachedData<IMysekaiTalk>("mysekaiCharacterTalks");
  const [characterGroups] = useCachedData<IMysekaiGameCharacterUnitGroups>(
    "mysekaiGameCharacterUnitGroups"
  );

  const [fixtures, setFixtures] = useState<IMysekaiFixtureInfo[]>([]);
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "mysekai-fixture-list-filter-sort-type",
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "mysekai-fixture-list-filter-sort-by",
    "id"
  );
  const [sortedCache, setSortedCache] = useState<IMysekaiFixtureInfo[]>([]);
  const [viewGridType, setViewGridType] =
    useLocalStorage<MysekaiFixtureViewGridType>(
      "mysekai-fixture-view-type",
      "grid"
    );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Filter states with localStorage persistence
  const [searchQuery, setSearchQuery] = useLocalStorage<string>(
    "mysekai-fixture-search",
    ""
  );
  const [filterGenre, setFilterGenre] = useLocalStorage<string>(
    "mysekai-fixture-genre",
    ""
  );
  const [filterSubGenre, setFilterSubGenre] = useLocalStorage<string>(
    "mysekai-fixture-subgenre",
    ""
  );
  const [filterTag, setFilterTag] = useLocalStorage<string>(
    "mysekai-fixture-tag",
    ""
  );
  const [filterChara, setFilterChara] = useLocalStorage<number[]>(
    "mysekai-fixture-chara",
    []
  );
  const [filterSketch, setFilterSketch] = useLocalStorage<string>(
    "mysekai-fixture-sketch",
    ""
  );
  const [filterConvert, setFilterConvert] = useLocalStorage<string>(
    "mysekai-fixture-convert",
    ""
  );
  const [filterAssembled, setFilterAssembled] = useLocalStorage<string>(
    "mysekai-fixture-assembled",
    ""
  );
  const [filterDisassembled, setFilterDisassembled] = useLocalStorage<string>(
    "mysekai-fixture-disassembled",
    ""
  );

  // Create data context object
  const dataContext: MysekaiDataContext = useMemo(
    () => ({
      blueprints,
      materialCosts,
      talkConditions,
      talkConditionGroups,
      talks,
      characterGroups,
    }),
    [
      blueprints,
      materialCosts,
      talkConditions,
      talkConditionGroups,
      talks,
      characterGroups,
    ]
  );

  // Filter and sort function
  const doFilter = useCallback(() => {
    if (!isReady || !fixturesCache?.length) return;

    // First, filter the data
    let filtered = fixturesCache.slice();

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((fixture) =>
        fixture.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (filterGenre) {
      filtered = filtered.filter(
        (fixture) =>
          fixture.mysekaiFixtureMainGenreId.toString() === filterGenre
      );
    }

    // Apply sub genre filter
    if (filterSubGenre) {
      filtered = filtered.filter((fixture) => {
        if (!fixture.mysekaiFixtureSubGenreId) return false;
        return fixture.mysekaiFixtureSubGenreId.toString() === filterSubGenre;
      });
    }

    // Apply tag filter
    if (filterTag) {
      filtered = filtered.filter((fixture) => {
        return Object.values(fixture.mysekaiFixtureTagGroup).includes(
          Number(filterTag)
        );
      });
    }

    if (Array.isArray(filterChara) && filterChara.length > 0) {
      const fixtureToCharacterMap = createFixtureToCharacterMap(
        filtered,
        dataContext
      );

      filtered = filtered.filter((fixture) => {
        const characters = fixtureToCharacterMap.get(fixture.id) || [];
        const realCharacters = characters.map((characterId: number) => {
          return charaMap(characterId);
        });
        return filterChara.some((charaId) => realCharacters.includes(charaId));
      });
    }

    // Apply sketch filter
    if (filterSketch) {
      const isSketch = filterSketch === "true";
      filtered = filtered.filter((fixture) => {
        const sketchStatus = getFixtureSketchStatus(fixture, dataContext);
        return (sketchStatus === 1) === isSketch;
      });
    }

    // Apply convert filter
    if (filterConvert) {
      const isConvert = filterConvert === "true";
      filtered = filtered.filter((fixture) => {
        const convertStatus = getFixtureConvertStatus(fixture, dataContext);
        return (convertStatus === 1) === isConvert;
      });
    }

    // Apply assembled filter
    if (filterAssembled) {
      const isAssembled = filterAssembled === "true";
      filtered = filtered.filter(
        (fixture) => fixture.isAssembled === isAssembled
      );
    }

    // Apply disassembled filter
    if (filterDisassembled) {
      const isDisassembled = filterDisassembled === "true";
      filtered = filtered.filter(
        (fixture) => fixture.isDisassembled === isDisassembled
      );
    }

    // Then, sort the filtered data
    filtered.sort((a, b) => {
      let compare = 0;
      switch (sortBy) {
        case "id":
          compare = a.id - b.id;
          break;
        case "name":
          compare = a.name.localeCompare(b.name);
          break;
        default:
          compare = a.id - b.id;
          break;
      }
      return sortType === "asc" ? compare : -compare;
    });
    setSortedCache(filtered);
    setFixtures([]);
    setPage(1);
  }, [
    fixturesCache,
    isReady,
    searchQuery,
    filterGenre,
    filterSubGenre,
    filterTag,
    filterChara,
    filterSketch,
    filterConvert,
    filterAssembled,
    filterDisassembled,
    sortType,
    sortBy,
    dataContext,
  ]);

  // Check if all necessary data is ready
  useEffect(() => {
    if (
      fixturesCache?.length &&
      genres?.length &&
      tags?.length &&
      gameCharas?.length &&
      talkConditions?.length &&
      talkConditionGroups?.length &&
      talks?.length &&
      characterGroups?.length
    ) {
      setIsReady(true);
    }
  }, [
    fixturesCache,
    genres,
    tags,
    gameCharas,
    talkConditions,
    talkConditionGroups,
    talks,
    characterGroups,
  ]);

  useEffect(() => {
    // Apply filters on initial load
    if (isReady) doFilter();
  }, [isReady]);

  // Set paginated fixtures when the sorted cache or page changes
  useEffect(() => {
    setFixtures((fixtures) => [
      ...fixtures,
      ...getPaginatedFixtures(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, sortedCache]);

  // page intersection observer
  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;

      if (entries[0].isIntersecting && lastQueryFin) {
        if (sortedCache.length > page * limit) {
          // More data available, load next page
          setPage((page) => page + 1);
          setLastQueryFin(false);
        } else {
          // No more data available
          setHasMore(false);
        }
      }
    },
    [isReady, lastQueryFin, limit, page, sortedCache.length]
  );

  const resetFilter = useCallback(() => {
    setSearchQuery("");
    setFilterGenre("");
    setFilterSubGenre("");
    setFilterTag("");
    setFilterChara([]);
    setFilterSketch("");
    setFilterConvert("");
    setFilterAssembled("");
    setFilterDisassembled("");
  }, [
    setSearchQuery,
    setFilterGenre,
    setFilterSubGenre,
    setFilterTag,
    setFilterChara,
    setFilterSketch,
    setFilterConvert,
    setFilterAssembled,
    setFilterDisassembled,
  ]);

  const applyFilters = useCallback(() => {
    doFilter();
    toggleFilterOpen();
  }, [doFilter, toggleFilterOpen]);

  if (!isReady) {
    return (
      <Container maxWidth="md">
        <TypographyHeader>{t("common:loading")}</TypographyHeader>
      </Container>
    );
  }

  return (
    <Fragment>
      <TypographyHeader>{t("mysekai:fixture.title")}</TypographyHeader>
      <ContainerContent>
        <Grid
          container
          justifyContent="space-between"
          style={{ marginBottom: "0.5rem" }}
        >
          <Grid item>
            <ToggleButtonGroup
              value={viewGridType}
              color="primary"
              exclusive
              onChange={(_, gridType) => {
                setViewGridType(
                  (gridType || "grid") as MysekaiFixtureViewGridType
                );
              }}
            >
              <ToggleButton value="grid">
                {viewGridType === "grid" ? <ViewGrid /> : <ViewGridOutlined />}
              </ToggleButton>
              <ToggleButton value="agenda">
                {viewGridType === "agenda" ? (
                  <ViewAgenda />
                ) : (
                  <ViewAgendaOutlined />
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item>
            <Badge
              color="secondary"
              variant="dot"
              invisible={
                !searchQuery &&
                !filterGenre &&
                !filterSubGenre &&
                !filterTag &&
                !filterChara &&
                !filterSketch &&
                !filterConvert &&
                !filterAssembled &&
                !filterDisassembled
              }
            >
              <ToggleButton
                value=""
                color="primary"
                selected={filterOpen}
                onClick={() => toggleFilterOpen()}
              >
                {filterOpen ? <Filter /> : <FilterOutline />}
                {filterOpen ? <Sort /> : <SortOutlined />}
              </ToggleButton>
            </Badge>
          </Grid>
        </Grid>

        <MysekaiFixtureFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterGenre={filterGenre}
          setFilterGenre={setFilterGenre}
          filterSubGenre={filterSubGenre}
          setFilterSubGenre={setFilterSubGenre}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          filterChara={filterChara}
          setFilterChara={setFilterChara}
          filterSketch={filterSketch}
          setFilterSketch={setFilterSketch}
          filterConvert={filterConvert}
          setFilterConvert={setFilterConvert}
          filterAssembled={filterAssembled}
          setFilterAssembled={setFilterAssembled}
          filterDisassembled={filterDisassembled}
          setFilterDisassembled={setFilterDisassembled}
          sortType={sortType}
          setSortType={setSortType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterOpen={filterOpen}
          genres={genres}
          subGenres={subGenres}
          tags={tags}
          gameCharas={gameCharas}
          onApplyFilters={applyFilters}
          onResetFilter={resetFilter}
        />

        <InfiniteScroll<IMysekaiFixtureInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={fixtures}
          gridSize={
            (
              {
                grid: {
                  xs: 6,
                  sm: 4,
                  md: 3,
                  xl: 2,
                },
                agenda: {
                  xs: 12,
                },
              } as const
            )[viewGridType]
          }
        />
      </ContainerContent>
    </Fragment>
  );
});

const ListCard: {
  [key: string]: React.FC<{
    data?: IMysekaiFixtureInfo;
  }>;
} = {
  agenda: AgendaView,
  grid: GridView,
};

export default MysekaiFixtureList;
