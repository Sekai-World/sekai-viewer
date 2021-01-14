import {
  Button,
  ButtonGroup,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import {
  GetApp,
  GetAppOutlined,
  Publish,
  PublishOutlined,
  Update,
} from "@material-ui/icons";
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
  const [updateSort, setUpdateSort] = useState<"asc" | "desc">(
    (localStorage.getItem("virtual-live-list-update-sort") || "desc") as "desc"
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
    if (updateSort === "desc") {
      sortedCache = sortedCache.sort((a, b) => b.startAt - a.startAt);
    } else if (updateSort === "asc") {
      sortedCache = sortedCache.sort((a, b) => a.startAt - b.startAt);
    }
    setSortedCache(sortedCache);
    setVirtualLives([]);
    setPage(0);
  }, [setPage, updateSort, virtualLivesCache]);

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

  const handleUpdateSort = useCallback((sort: "asc" | "desc") => {
    setUpdateSort(sort);
    localStorage.setItem("virtual-live-list-update-sort", sort);
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:virtualLive")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => handleUpdateSort("asc")}>
              <Update />
              {updateSort === "asc" ? <Publish /> : <PublishOutlined />}
            </Button>
            <Button size="medium" onClick={() => handleUpdateSort("desc")}>
              <Update />
              {updateSort === "desc" ? <GetApp /> : <GetAppOutlined />}
            </Button>
          </ButtonGroup>
        </Grid>
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
