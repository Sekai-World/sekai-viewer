import { Grid, Link, Typography } from "@mui/material";
import { Telegram, Twitter, YouTube } from "@mui/icons-material";
import { Alert, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Vk from "~icons/entypo-social/vk";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { ComicLangType, ITipInfo, ITipInfoComic } from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import InfiniteScroll from "../../components/helpers/InfiniteScroll";
import GridView from "./GridView";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";

const ListCard: React.FC<{
  data?: ITipInfoComic;
  index?: number;
  lang?: ComicLangType;
  handleCardClick?: (index: number) => void;
}> = GridView;

const ComicList: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const {
    settings: { contentTransMode },
  } = useRootStore();
  const { getTranslated } = useAssetI18n();

  const [tipsCache] = useCachedData<ITipInfo>("tips");

  const [comics, setComics] = useState<ITipInfoComic[]>([]);
  const [filteredCache, setFilteredCache] = useState<ITipInfoComic[]>([]);

  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [resourceLang, setResourceLang] = useState<ComicLangType>("ja");
  const [comicImages, setComicImages] = useState<ImageDecorator[]>([]);

  const getPaginatedTips = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  useEffect(() => {
    const f = async () => {
      const images: ImageDecorator[] = [];
      for (let comic of filteredCache) {
        let url;
        switch (resourceLang) {
          case "ja":
          case "zht":
          case "en":
          case "kr":
            url = `comic/one_frame_rip/${comic.assetbundleName}.webp`;
            break;
          default:
            url = `${resourceLang}/${comic.assetbundleName}.png`;
            break;
        }
        console.log(resourceLang, url);
        images.push({
          src: await getRemoteAssetURL(
            url,
            undefined,
            window.isChinaMainland ? "cn" : "minio",
            resourceLang === "zht"
              ? "tw"
              : resourceLang === "ja"
              ? "jp"
              : resourceLang === "en"
              ? "en"
              : resourceLang === "kr"
              ? "kr"
              : "comic"
          ),
          alt: getTranslated(`comic_title:${comic.id}`, comic.title),
          downloadUrl: await getRemoteAssetURL(
            url.replace(".webp", ".png"),
            undefined,
            window.isChinaMainland ? "cn" : "minio",
            resourceLang === "zht"
              ? "tw"
              : resourceLang === "ja"
              ? "jp"
              : resourceLang === "en"
              ? "en"
              : resourceLang === "kr"
              ? "kr"
              : "comic"
          ),
        });
      }
      setComicImages(images);
    };

    f();
  }, [filteredCache, contentTransMode, getTranslated, resourceLang]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!filteredCache.length || filteredCache.length > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (filteredCache.length && filteredCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [filteredCache.length, isReady, lastQueryFin, limit, page]
  );

  useEffect(() => {
    document.title = t("title:comicList");
  }, [t]);

  useEffect(() => {
    if (tipsCache && tipsCache.length) {
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
    setIsReady(Boolean(tipsCache && tipsCache.length));
  }, [setIsReady, tipsCache]);

  return (
    <Fragment>
      <TypographyHeader>{t("common:comic")}</TypographyHeader>
      <ContainerContent>
        <Grid container justifyContent="space-between">
          <ToggleButtonGroup
            value={resourceLang}
            exclusive
            onChange={(ev, lang) => setResourceLang((lang || "ja") as "ja")}
            style={{ marginBottom: "1%" }}
            aria-label="resource language"
          >
            <ToggleButton size="medium" value="ja">
              <Typography>JA</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="fr">
              <Typography>FR</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="ru">
              <Typography>RU</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="zhs">
              <Typography>简</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="zht">
              <Typography>繁</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="en">
              <Typography>EN</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="ua">
              <Typography>UA</Typography>
            </ToggleButton>
            <ToggleButton size="medium" value="kr">
              <Typography>KR</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        {resourceLang === "fr" ? (
          <Alert severity="info">
            <Typography>
              Credit: Yasito (
              <Link
                href="https://twitter.com/pjsekai_fra"
                style={{ textDecorationLine: "none" }}
                underline="hover"
              >
                <Twitter fontSize="inherit" /> @pjsekai_fra
              </Link>
              )
            </Typography>
          </Alert>
        ) : resourceLang === "ru" ? (
          <Alert severity="info">
            <Typography>
              Credit:
              <Link
                href="https://vk.com/pjsekai_ru"
                style={{ textDecorationLine: "none" }}
                underline="hover"
              >
                <Vk fontSize="inherit" /> Project SEKAI Russian Group
              </Link>
            </Typography>
          </Alert>
        ) : resourceLang === "zhs" ? (
          <Alert severity="info">
            <Typography>
              Credit:
              <Link
                href="https://space.bilibili.com/13148307/"
                style={{ textDecorationLine: "none" }}
                underline="hover"
              >
                Project_SEKAI资讯站@bilibili
              </Link>
            </Typography>
          </Alert>
        ) : resourceLang === "ua" ? (
          <Alert severity="info">
            <Typography>
              Credit:
              <Link
                href="https://www.youtube.com/channel/UCREl7H5eA6nqacplqY1rhhg"
                style={{ textDecorationLine: "none" }}
                underline="hover"
              >
                <YouTube fontSize="inherit" /> Соняшниковий Секай
              </Link>
              <Link
                href="https://t.me/sunflowersekai"
                style={{ textDecorationLine: "none" }}
                underline="hover"
              >
                <Telegram fontSize="inherit" /> Соняшниковий Секай
              </Link>
            </Typography>
          </Alert>
        ) : // ) : resourceLang === "zht" ? (
        //   <Alert severity="info">
        //     <Typography>Credit: CHKO</Typography>
        //   </Alert>
        // ) : resourceLang === "en" ? (
        //   <Alert severity="info">
        //     <Typography>
        //       Credit:{" "}
        //       <Link
        //         href="https://twitter.com/pjsekai_eng"
        //         style={{ textDecorationLine: "none" }}
        //         underline="hover"
        //       >
        //         <Twitter fontSize="inherit" /> @pjsekai_eng
        //       </Link>
        //     </Typography>
        //   </Alert>
        null}
        <InfiniteScroll<ITipInfoComic>
          ViewComponent={ListCard}
          callback={callback}
          data={comics}
          gridSize={{
            xs: 12,
            md: 4,
            lg: 3,
          }}
          viewProps={{
            lang: resourceLang,
            handleCardClick: (index: number) => {
              setActiveIdx(index);
              setVisible(true);
            },
          }}
        />
      </ContainerContent>
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
});

export default ComicList;
