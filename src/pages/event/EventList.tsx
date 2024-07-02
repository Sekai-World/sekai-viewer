import React, { Fragment, useEffect, useState, useCallback } from "react";
import { IEventInfo } from "../../types.d";
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
import {
  Badge,
  Collapse,
  FormControl,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import Pound from "~icons/mdi/pound";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import { useDebounce } from "use-debounce";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

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
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [debouncedSearchTitle] = useDebounce(searchTitle, 500);

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
    if (!eventsCache || !eventsCache.length) return;
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
    if (debouncedSearchTitle) {
      sortedCache = sortedCache.filter((e) =>
        e.name.toLowerCase().includes(debouncedSearchTitle.toLowerCase())
      );
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
    debouncedSearchTitle,
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
            <Badge color="secondary" variant="dot" invisible={!searchTitle}>
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
        <Collapse in={filterOpened}>
          <PaperContainer>
            <Grid container direction="column" spacing={2}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>{t("common:title")}</TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <FormControl size="small">
                    <TextField
                      size="small"
                      fullWidth
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      sx={{ minWidth: "200px" }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
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
