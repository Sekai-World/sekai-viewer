import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType, ITipInfo, ITipInfoComic } from "../types";
import { useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
  },
}));

const ComicList: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

  const [tipsCache] = useCachedData<ITipInfo>("tips");

  const [comics, setComics] = useState<ITipInfoComic[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    ITipInfoComic[]
  >([]);

  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const getPaginatedTips = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!filteredCacheRef.current.length ||
        filteredCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      filteredCacheRef.current.length &&
      filteredCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    document.title = t("title:comicList");
  }, [t]);

  useEffect(() => {
    if (tipsCache.length) {
      const filtered = tipsCache.filter(
        (tip): tip is ITipInfoComic => "assetbundleName" in tip
      );
      setFilteredCache(filtered);
      setComics([]);
      setPage(0);
    }
  }, [tipsCache, setComics, setPage, setFilteredCache]);

  useEffect(() => {
    setComics((tips) => [...tips, ...getPaginatedTips(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, tipsCache, setLastQueryFin, getPaginatedTips]);

  useEffect(() => {
    setIsReady(Boolean(tipsCache.length));
  }, [setIsReady, tipsCache]);

  const ListCard: React.FC<{ data?: ITipInfoComic }> = ({ data }) => {
    if (!data) {
      // loading
      return (
        <Card className={classes.card}>
          <Skeleton variant="rect" className={classes.media}></Skeleton>
          <CardContent>
            <Typography variant="subtitle1" className={classes.subheader}>
              <Skeleton
                variant="text"
                width="90%"
                style={{ margin: "auto" }}
              ></Skeleton>
            </Typography>
          </CardContent>
        </Card>
      );
    }
    const imageURL = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/comic/one_frame_rip/${data.assetbundleName}.webp`;
    return (
      <Link href={imageURL} target="_blank" style={{ textDecoration: "none" }}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={imageURL}
            title={data.title}
          ></CardMedia>
          <CardContent style={{ paddingBottom: "16px" }}>
            <Typography variant="subtitle1" className={classes.subheader}>
              {data.title}
            </Typography>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:comic")}
      </Typography>
      <Container className={layoutClasses.content}>
        {InfiniteScroll<ITipInfoComic>({
          viewComponent: ListCard,
          callback,
          data: comics,
          gridSize: {
            xs: 12,
            md: 6,
            lg: 4,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default ComicList;
