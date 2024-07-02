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
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  FormControl,
  TextField,
} from "@mui/material";
import Pound from "~icons/mdi/pound";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IVirtualLiveInfo } from "../../types.d";
import { useCachedData, useLocalStorage, useToggle } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import AgendaView from "./AgendaView";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import { useDebounce } from "use-debounce";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

type ViewGridType = "agenda";

function getPaginatedVirtualLives(
  virtualLives: IVirtualLiveInfo[],
  page: number,
  limit: number
) {
  return virtualLives.slice(limit * (page - 1), limit * page);
}

const ListCard: { [key: string]: React.FC<{ data?: IVirtualLiveInfo }> } = {
  agenda: AgendaView,
};

const VirtualLiveList: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { isShowSpoiler },
  } = useRootStore();

  const [virtualLives, setVirtualLives] = useState<IVirtualLiveInfo[]>([]);
  const [virtualLivesCache] = useCachedData<IVirtualLiveInfo>("virtualLives");

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("virtual-live-list-grid-view-type") ||
      "agenda") as ViewGridType
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sortType, setSortType] = useLocalStorage<string>(
    "gacha-list-update-sort",
    "desc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "gacha-list-filter-sort-by",
    "startAt"
  );
  const [sortedCache, setSortedCache] = useState<IVirtualLiveInfo[]>([]);
  const [filterOpened, toggleFilterOpened] = useToggle(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [debouncedSearchTitle] = useDebounce(searchTitle, 500);

  useEffect(() => {
    document.title = t("title:virtualLiveList");
  }, [t]);

  useEffect(() => {
    setVirtualLives((virtualLives) => [
      ...virtualLives,
      ...getPaginatedVirtualLives(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    if (!virtualLivesCache?.length) return;
    let sortedCache = [...virtualLivesCache];
    if (!isShowSpoiler) {
      sortedCache = sortedCache.filter(
        (vl) =>
          (vl.virtualLiveSchedules[0]
            ? vl.virtualLiveSchedules[0].startAt
            : vl.startAt) <= new Date().getTime()
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
      sortedCache = sortedCache.filter((vl) =>
        vl.name.toLowerCase().includes(debouncedSearchTitle.toLowerCase())
      );
    }
    setSortedCache(sortedCache);
    setVirtualLives([]);
    setPage(0);
  }, [
    debouncedSearchTitle,
    isShowSpoiler,
    sortBy,
    sortType,
    virtualLivesCache,
  ]);

  useEffect(() => {
    setIsReady(!!virtualLivesCache?.length);
  }, [virtualLivesCache?.length]);

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
      <TypographyHeader>{t("common:virtualLive")}</TypographyHeader>
      <ContainerContent>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Grid container spacing={1}>
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
        <InfiniteScroll<IVirtualLiveInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={virtualLives}
          gridSize={
            (
              {
                agenda: {
                  xs: 12,
                  lg: 6,
                },
              } as const
            )[viewGridType]
          }
        />
      </ContainerContent>
    </Fragment>
  );
});

export default VirtualLiveList;
