import {
  Card,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
  Container,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { IGachaInfo } from "../types";
import { SettingContext } from "../context";
import { ContentTrans } from "./subs/ContentTrans";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "260px",
  },
}));

function getPaginatedGachas(gachas: IGachaInfo[], page: number, limit: number) {
  return gachas.slice(limit * (page - 1), limit * page);
}

const GachaList: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;

  const [gachas, setGachas] = useState<IGachaInfo[]>([]);
  const [gachasCache, gachasCacheRef] = useCachedData<IGachaInfo>("gachas");

  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  useEffect(() => {
    document.title = t("title:gachaList");
  }, [t]);

  useEffect(() => {
    setGachas((gachas) => [
      ...gachas,
      ...getPaginatedGachas(gachasCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, gachasCache]);

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

  const ListCard: React.FC<{ data?: IGachaInfo }> = ({ data }) => {
    if (!data) {
      // loading
      return (
        <Card className={classes.card}>
          <Skeleton variant="rect" className={classes.media}></Skeleton>
          <CardContent>
            <Typography variant="subtitle1" className={classes.subheader}>
              <Skeleton variant="text" width="90%"></Skeleton>
            </Typography>
          </CardContent>
        </Card>
      );
    }
    return (
      <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${data.assetbundleName}/logo_rip/logo.webp`}
            title={data.name}
          ></CardMedia>
          <CardContent style={{ paddingBottom: "16px" }}>
            <ContentTrans
              mode={contentTransMode}
              contentKey={`gacha_name:${data.id}`}
              original={data.name}
              originalProps={{
                variant: "subtitle1",
                className: classes.subheader,
              }}
              translatedProps={{
                variant: "subtitle1",
                className: classes.subheader,
              }}
            />
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:gacha")}
      </Typography>
      <Container className={layoutClasses.content}>
        {InfiniteScroll<IGachaInfo>({
          viewComponent: ListCard,
          callback,
          data: gachas,
          gridSize: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default GachaList;
