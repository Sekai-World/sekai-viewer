import { Container, Grid, Typography } from "@material-ui/core";
import {
  GetApp,
  GetAppOutlined,
  Publish,
  PublishOutlined,
  Update,
} from "@material-ui/icons";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { Pound } from "mdi-material-ui";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import { IVirtualLiveInfo } from "../../types";
import { useCachedData } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";
import AgendaView from "./AgendaView";

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

const VirtualLiveList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

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
  const [sortType, setSortType] = useState<string>(
    (localStorage.getItem("gacha-list-update-sort") || "desc") as "desc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("gacha-list-filter-sort-by") || "startAt"
  );
  const [sortedCache, setSortedCache] = useState<IVirtualLiveInfo[]>([]);

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
    if (!virtualLivesCache) return;
    let sortedCache = [...virtualLivesCache];
    if (sortType === "desc") {
      sortedCache = sortedCache.sort(
        (a, b) => b[sortBy as "startAt"] - a[sortBy as "startAt"]
      );
    } else if (sortType === "asc") {
      sortedCache = sortedCache.sort(
        (a, b) => a[sortBy as "startAt"] - b[sortBy as "startAt"]
      );
    }
    setSortedCache(sortedCache);
    setVirtualLives([]);
    setPage(0);
  }, [setPage, sortBy, sortType, virtualLivesCache]);

  useEffect(() => {
    setIsReady(Boolean(virtualLivesCache));
  }, [setIsReady, virtualLivesCache]);

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

  const handleUpdateSortType = useCallback((_, sort: string) => {
    setSortType(sort);
    localStorage.setItem("gacha-list-filter-sort-type", sort);
  }, []);

  const handleUpdateSortBy = useCallback((_, sort: string) => {
    setSortBy(sort);
    localStorage.setItem("gacha-list-filter-sort-by", sort);
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:virtualLive")}
      </Typography>
      <Container className={layoutClasses.content}>
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
        <br />
        <InfiniteScroll<IVirtualLiveInfo>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={virtualLives}
          gridSize={
            ({
              agenda: {
                xs: 12,
              },
            } as const)[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default VirtualLiveList;
