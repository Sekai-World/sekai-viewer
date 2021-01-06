import {
  Typography,
  Container,
  Button,
  ButtonGroup,
  Grid,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useCachedData, useRefState } from "../../utils";
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
  const [gachasCache, gachasCacheRef] = useCachedData<IGachaInfo>("gachas");

  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
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
    setIsReady(Boolean(gachasCache.length));
  }, [setIsReady, gachasCache]);

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!gachasCacheRef.current.length ||
        gachasCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      gachasCacheRef.current.length &&
      gachasCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

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
