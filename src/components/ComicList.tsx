import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Twitter } from "@material-ui/icons";
import { Alert, Skeleton } from "@material-ui/lab";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { SettingContext } from "../context";
import { useLayoutStyles } from "../styles/layout";
import { ITipInfo, ITipInfoComic } from "../types";
import { useCachedData, useRefState } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { ContentTrans } from "./subs/ContentTrans";
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

const ComicList: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const { getTranslated } = useAssetI18n();

  const [tipsCache] = useCachedData<ITipInfo>("tips");

  const [comics, setComics] = useState<ITipInfoComic[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    ITipInfoComic[]
  >([]);

  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [resourceLang, setResourceLang] = useState<"ja" | "fr">("ja");

  const getPaginatedTips = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  const comicImages: ImageDecorator[] = useMemo(
    () =>
      filteredCache.map((comic) => {
        let url;
        switch (resourceLang) {
          case "ja":
            url = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/comic/one_frame_rip/${comic.assetbundleName}.webp`;
            break;
          case "fr":
            url = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/comic_fr/${comic.assetbundleName}.png`;
            break;
        }
        return {
          src: url,
          alt: getTranslated(
            contentTransMode,
            `comic_title:${comic.id}`,
            comic.title
          ),
          downloadUrl: url,
        };
      }),
    [filteredCache, contentTransMode, getTranslated, resourceLang]
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

  const ListCard: React.FC<{ data?: ITipInfoComic; index?: number }> = ({
    data,
    index,
  }) => {
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
    let imageURL;
    switch (resourceLang) {
      case "ja":
        imageURL = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/comic/one_frame_rip/${data.assetbundleName}.webp`;
        break;
      case "fr":
        imageURL = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/comic_fr/${data.assetbundleName}.png`;
        break;
    }
    return (
      <Card
        className={classes.card}
        onClick={() => {
          setActiveIdx(index!);
          setVisible(true);
        }}
      >
        <CardMedia
          className={classes.media}
          image={imageURL}
          title={data.title}
        ></CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <ContentTrans
            mode={contentTransMode}
            contentKey={`comic_title:${data.id}`}
            original={data.title}
            originalProps={{
              variant: "subtitle1",
            }}
            translatedProps={{
              variant: "subtitle1",
            }}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:comic")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="space-between">
          <ButtonGroup style={{ marginBottom: "1%" }}>
            <Button
              size="medium"
              color={resourceLang === "ja" ? "secondary" : "primary"}
              onClick={() => setResourceLang("ja")}
            >
              <Typography>JA</Typography>
            </Button>
            <Button
              size="medium"
              color={resourceLang === "fr" ? "secondary" : "primary"}
              onClick={() => setResourceLang("fr")}
            >
              <Typography>FR</Typography>
            </Button>
          </ButtonGroup>
        </Grid>
        {resourceLang === "fr" ? (
          <Alert severity="info">
            <Typography>
              Credit: Yasito (
              <Link
                href="https://twitter.com/pjsekai_fra"
                style={{ textDecorationLine: "none" }}
              >
                <Twitter fontSize="inherit" /> @pjsekai_fra
              </Link>
              )
            </Typography>
          </Alert>
        ) : null}
        {InfiniteScroll<ITipInfoComic>({
          viewComponent: ListCard,
          callback,
          data: comics,
          gridSize: {
            xs: 12,
            md: 4,
            lg: 3,
          },
        })}
      </Container>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={comicImages}
        zIndex={2000}
        activeIndex={activeIdx}
        downloadable
        downloadInNewWindow
        onMaskClick={() => setVisible(false)}
        onChange={(_, idx) => setActiveIdx(idx)}
        zoomSpeed={0.25}
      />
    </Fragment>
  );
};

export default ComicList;
