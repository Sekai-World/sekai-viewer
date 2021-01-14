import {
  Typography,
  Container,
  Button,
  ButtonGroup,
  Grid,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useCachedData } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { IGachaInfo } from "../../types";
import GridView from "./GridView";
import {
  Update,
  Publish,
  PublishOutlined,
  GetApp,
  GetAppOutlined,
} from "@material-ui/icons";

function getPaginatedGachas(gachas: IGachaInfo[], page: number, limit: number) {
  return gachas.slice(limit * (page - 1), limit * page);
}

const ListCard: React.FC<{ data?: IGachaInfo }> = GridView;

const GachaList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  const [gachas, setGachas] = useState<IGachaInfo[]>([]);
  const [gachasCache] = useCachedData<IGachaInfo>("gachas");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [updateSort, setUpdateSort] = useState<"asc" | "desc">(
    (localStorage.getItem("gacha-list-update-sort") || "desc") as "desc"
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
    if (updateSort === "desc") {
      sortedCache = sortedCache.sort((a, b) => b.startAt - a.startAt);
    } else if (updateSort === "asc") {
      sortedCache = sortedCache.sort((a, b) => a.startAt - b.startAt);
    }
    setSortedCache(sortedCache);
    setGachas([]);
    setPage(0);
  }, [updateSort, gachasCache, setPage]);

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

  const handleUpdateSort = useCallback((sort: "asc" | "desc") => {
    setUpdateSort(sort);
    localStorage.setItem("gacha-list-update-sort", sort);
  }, []);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:gacha")}
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
};

export default GachaList;
