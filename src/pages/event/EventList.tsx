import React, {
  Fragment,
  useEffect,
  useState,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import {
  IEventDeckBonus,
  IEventInfo,
  IEventMusic,
  IEventStory,
  IEventStoryUnit,
  IGameCharaUnit,
} from "../../types.d";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";

import { useTranslation } from "react-i18next";
import GridView from "./GridView";
import {
  GetApp,
  GetAppOutlined,
  Publish,
  PublishOutlined,
  Update,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutlined,
} from "@mui/icons-material";
import { Badge, Grid, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Pound from "~icons/mdi/pound";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import EventListFilter, { EventFilterData } from "./EventListFilter";
import { eventListFilterReducer } from "../../stores/reducers";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedEvents(events: IEventInfo[], page: number, limit: number) {
  return events.slice(limit * (page - 1), limit * page);
}

const ListCard: { [key: string]: React.FC<{ data?: IEventInfo }> } = {
  grid: GridView,
};

const EventList: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { isShowSpoiler },
  } = useRootStore();

  const [eventsCache] = useCachedData<IEventInfo>("events");
  const [events, setEvents] = useState<IEventInfo[]>([]);

  const [eventMusicsCache] = useCachedData<IEventMusic>("eventMusics");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [eventStories] = useCachedData<IEventStory>("eventStories");
  const [eventStoryUnits] = useCachedData<IEventStoryUnit>("eventStoryUnits");
  const [gameCharacterUnits] =
    useCachedData<IGameCharaUnit>("gameCharacterUnits");

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "event-list-update-sort",
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "event-list-filter-sort-by",
    "startAt"
  );
  const [sortedCache, setSortedCache] = useState<IEventInfo[]>([]);
  const [filterOpened, toggleFilterOpened] = useToggle(false);

  const [filterData, dispatchFilterData] = useReducer(
    eventListFilterReducer,
    localStorage.getItem("event-list-filter-data"),
    (stored: string | null) => {
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        searchTitle: "",
        eventType: [],
        startAtType: undefined,
        startAt: undefined,
        eventUnitType: undefined,
        eventUnit: [],
        isKeyEventStory: "both",
        hasEventMusic: "both",
        eventBonusAttr: [],
        eventBonusCharaId: [],
        eventBonusCharaSupportUnit: [],
      } as EventFilterData;
    }
  );
  const isFilterNotEmpty = useMemo(
    () =>
      Object.values(filterData).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string")
          return value.trim() !== "" && value !== "both";
        return value !== null && value !== undefined;
      }),
    [filterData]
  );

  useEffect(() => {
    document.title = t("title:eventList");
  }, [t]);

  useEffect(() => {
    setEvents((events) => [
      ...events,
      ...getPaginatedEvents(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    if (
      !eventsCache?.length ||
      !eventMusicsCache?.length ||
      !eventStories?.length ||
      !eventStoryUnits?.length ||
      !eventDeckBonuses?.length ||
      !gameCharacterUnits?.length
    )
      return;
    let sortedCache = [...eventsCache];
    if (!isShowSpoiler) {
      sortedCache = sortedCache.filter(
        (e) => e.startAt <= new Date().getTime()
      );
    }
    if (sortType === "desc") {
      sortedCache = sortedCache.sort(
        (a, b) => b[sortBy as "startAt"] - a[sortBy as "startAt"]
      );
    } else if (sortType === "asc") {
      sortedCache = sortedCache.sort(
        (a, b) => a[sortBy as "startAt"] - b[sortBy as "startAt"]
      );
    }
    if (filterData.searchTitle) {
      sortedCache = sortedCache.filter((e) =>
        e.name.toLowerCase().includes(filterData.searchTitle.toLowerCase())
      );
    }
    if (filterData.eventType.length) {
      sortedCache = sortedCache.filter((e) =>
        filterData.eventType.includes(e.eventType)
      );
    }
    if (filterData.startAtType && filterData.startAt) {
      const startAt = filterData.startAt;
      if (filterData.startAtType === "before") {
        sortedCache = sortedCache.filter((e) => e.startAt < startAt);
      } else if (filterData.startAtType === "after") {
        sortedCache = sortedCache.filter((e) => e.startAt > startAt);
      }
    }
    if (filterData.eventUnitType) {
      switch (filterData.eventUnitType) {
        case "event":
          {
            sortedCache = sortedCache.filter((e) =>
              filterData.eventUnit.length
                ? filterData.eventUnit.includes(e.unit)
                : e.unit === "none"
            );
          }
          break;
        case "eventStory":
          {
            sortedCache = sortedCache.filter((e) => {
              const story = eventStories.find((es) => es.eventId === e.id);
              if (!story) return false;
              const storyUnits = eventStoryUnits
                .filter((esu) => esu.eventStoryId === story.id)
                .map((su) => su.unit);
              return filterData.eventUnit.some((unit) =>
                storyUnits.includes(unit)
              );
            });
          }
          break;
        case "eventStoryMain":
          {
            sortedCache = sortedCache.filter((e) => {
              const story = eventStories.find((es) => es.eventId === e.id);
              if (!story) return false;
              const storyMainUnits = eventStoryUnits
                .filter(
                  (esu) =>
                    esu.eventStoryId === story.id &&
                    esu.eventStoryUnitRelation === "main"
                )
                .map((su) => su.unit);
              return filterData.eventUnit.some((unit) =>
                storyMainUnits.includes(unit)
              );
            });
          }
          break;
      }
    }
    if (filterData.isKeyEventStory !== "both") {
      sortedCache = sortedCache.filter((e) => {
        const story = eventStories.find((es) => es.eventId === e.id);
        if (!story) return filterData.isKeyEventStory === "excl";
        const mainStoryUnit = eventStoryUnits.some(
          (esu) =>
            esu.eventStoryId === story.id &&
            esu.eventStoryUnitRelation === "main"
        );
        return filterData.isKeyEventStory === "excl"
          ? !mainStoryUnit
          : mainStoryUnit;
      });
    }
    if (filterData.hasEventMusic !== "both") {
      sortedCache = sortedCache.filter(
        (e) =>
          (filterData.hasEventMusic === "incl" &&
            eventMusicsCache.some((em) => em.eventId === e.id)) ||
          (filterData.hasEventMusic === "excl" &&
            !eventMusicsCache.some((em) => em.eventId === e.id))
      );
    }
    if (filterData.eventBonusAttr.length) {
      sortedCache = sortedCache.filter((e) => {
        const bonus = eventDeckBonuses.find(
          (edb) =>
            edb.eventId === e.id && !edb.gameCharacterUnitId && edb.cardAttr
        );
        if (!bonus) return false;
        return filterData.eventBonusAttr.includes(bonus.cardAttr!);
      });
    }
    if (filterData.eventBonusCharaId.length) {
      if (!filterData.eventBonusCharaSupportUnit.length) {
        // gameCharacterUnitId is the same as charaId for event bonuses
        sortedCache = sortedCache.filter((e) =>
          eventDeckBonuses.some(
            (edb) =>
              edb.eventId === e.id &&
              edb.gameCharacterUnitId &&
              filterData.eventBonusCharaId.includes(edb.gameCharacterUnitId)
          )
        );
      } else {
        const isSupportUnitNeeded = filterData.eventBonusCharaId.some(
          (charaId) => charaId >= 21
        );
        if (isSupportUnitNeeded) {
          // search gameCharacterUnitId with support unit
          sortedCache = sortedCache.filter((e) => {
            return eventDeckBonuses.some((edb) => {
              if (edb.eventId !== e.id || !edb.gameCharacterUnitId)
                return false;
              const charaUnit = gameCharacterUnits.find(
                (cu) => cu.id === edb.gameCharacterUnitId
              );
              if (!charaUnit) return false;
              return charaUnit.gameCharacterId >= 21
                ? filterData.eventBonusCharaSupportUnit.includes(charaUnit.unit)
                : filterData.eventBonusCharaId.includes(
                    charaUnit.gameCharacterId
                  );
            });
          });
        } else {
          // search support unit "piapro" only
          sortedCache = sortedCache.filter((e) => {
            return eventDeckBonuses.some((edb) => {
              if (edb.eventId !== e.id || !edb.gameCharacterUnitId)
                return false;
              const charaUnit = gameCharacterUnits.find((cu) =>
                cu.gameCharacterId >= 21
                  ? cu.id === edb.gameCharacterUnitId && cu.unit === "piapro"
                  : cu.id === edb.gameCharacterUnitId
              );
              if (!charaUnit) return false;
              return filterData.eventBonusCharaId.includes(
                charaUnit.gameCharacterId
              );
            });
          });
        }
      }
    }
    setSortedCache(sortedCache);
    setEvents([]);
    setPage(0);
  }, [
    eventsCache,
    setPage,
    sortType,
    sortBy,
    isShowSpoiler,
    filterData,
    eventMusicsCache,
    eventStories,
    eventStoryUnits,
    eventDeckBonuses,
    gameCharacterUnits,
  ]);

  useEffect(() => {
    setIsReady(!!eventsCache?.length);
  }, [eventsCache?.length]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!sortedCache.length || sortedCache.length > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (sortedCache.length && sortedCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [isReady, lastQueryFin, limit, page, sortedCache.length]
  );

  const handleUpdateSortType = useCallback(
    (_: any, sort: string) => {
      setSortType(sort || "asc");
    },
    [setSortType]
  );

  const handleUpdateSortBy = useCallback(
    (_: any, sort: string) => {
      setSortBy(sort || "id");
    },
    [setSortBy]
  );

  return (
    <Fragment>
      <TypographyHeader>{t("common:event")}</TypographyHeader>
      <ContainerContent>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Grid container spacing={1} style={{ marginBottom: "0.5rem" }}>
              <Grid item>
                <ToggleButtonGroup
                  value={sortType}
                  color="primary"
                  exclusive
                  onChange={handleUpdateSortType}
                >
                  <ToggleButton value="asc">
                    {sortType === "asc" ? <Publish /> : <PublishOutlined />}
                  </ToggleButton>
                  <ToggleButton value="desc">
                    {sortType === "desc" ? <GetApp /> : <GetAppOutlined />}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item>
                <ToggleButtonGroup
                  size="medium"
                  value={sortBy}
                  color="primary"
                  exclusive
                  onChange={handleUpdateSortBy}
                >
                  <ToggleButton value="id">
                    <Pound />
                  </ToggleButton>
                  <ToggleButton value="startAt">
                    <Update />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Badge
              color="secondary"
              variant="dot"
              invisible={!isFilterNotEmpty}
            >
              <ToggleButton
                value=""
                color="primary"
                selected={filterOpened}
                onClick={() => toggleFilterOpened()}
              >
                {filterOpened ? <Filter /> : <FilterOutlined />}
              </ToggleButton>
            </Badge>
          </Grid>
        </Grid>
        <EventListFilter
          filterOpened={filterOpened}
          toggleFilterOpened={toggleFilterOpened}
          filterData={filterData}
          onFilterDataChange={(data) =>
            dispatchFilterData({ type: "update", payload: data })
          }
        />
        <InfiniteScroll<IEventInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={events}
          gridSize={
            (
              {
                grid: {
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                },
                agenda: {
                  xs: 12,
                },
                comfy: {
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

export default EventList;
