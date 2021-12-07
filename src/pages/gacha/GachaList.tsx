import { Typography, Container, Grid } from "@mui/material";
import { useLayoutStyles } from "../../styles/layout";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useCachedData, useLocalStorage } from "../../utils";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { IGachaInfo } from "../../types.d";
import GridView from "./GridView";
import {
  Update,
  Publish,
  PublishOutlined,
  GetApp,
  GetAppOutlined,
} from "@mui/icons-material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import Pound from "~icons/mdi/pound";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";

function getPaginatedGachas(gachas: IGachaInfo[], page: number, limit: number) {
  return gachas.slice(limit * (page - 1), limit * page);
}

const ListCard: React.FC<{ data?: IGachaInfo }> = GridView;

const GachaList: React.FC<{}> = observer(() => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const {
    settings: { isShowSpoiler },
  } = useRootStore();

  const [gachas, setGachas] = useState<IGachaInfo[]>([]);
  const [gachasCache] = useCachedData<IGachaInfo>("gachas");

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
  const [sortedCache, setSortedCache] = useState<IGachaInfo[]>([]);

  useEffect(() => {
    document.title = t("title:gachaList");
  }, [t]);

  useEffect(() => {
    setGachas((gachas) => [
      ...gachas,
      ...getPaginatedGachas(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    if (!gachasCache || !gachasCache.length) return;
    let sortedCache = [...gachasCache];
    if (!isShowSpoiler) {
      sortedCache = sortedCache.filter(
        (g) => g.startAt <= new Date().getTime()
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
    setSortedCache(sortedCache);
    setGachas([]);
    setPage(0);
  }, [gachasCache, setPage, sortType, sortBy, isShowSpoiler]);

  useEffect(() => {
    setIsReady(Boolean(gachasCache && gachasCache.length));
  }, [setIsReady, gachasCache]);

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
    (_, sort: string) => {
      setSortType(sort || "asc");
    },
    [setSortType]
  );

  const handleUpdateSortBy = useCallback(
    (_, sort: string) => {
      setSortBy(sort || "id");
    },
    [setSortBy]
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:gacha")}
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
        <InfiniteScroll<IGachaInfo>
          ViewComponent={ListCard}
          callback={callback}
          data={gachas}
          gridSize={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        />
      </Container>
    </Fragment>
  );
});

export default GachaList;
