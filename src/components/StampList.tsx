import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Container,
  Grid,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Sort, SortOutlined } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { FilterOutline, Filter } from "mdi-material-ui";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { characterSelectReducer } from "../stores/reducers";
import { useFilterStyles } from "../styles/filter";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType, ICharaProfile, IStampInfo } from "../types";
import { useCachedData, useRefState } from "../utils";
import { getAssetI18n } from "../utils/i18n";
import { charaIcons } from "../utils/resources";
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
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "260px",
  },
}));

const StampList: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const filterClasses = useFilterStyles();
  const { t } = useTranslation();
  const assetI18n = getAssetI18n();

  const [stampsCache] = useCachedData<IStampInfo>("stamps");
  const [charas] = useCachedData<ICharaProfile>("gameCharacters");

  const [stamps, setStamps] = useState<IStampInfo[]>([]);
  const [filteredCache, filteredCacheRef, setFilteredCache] = useRefState<
    IStampInfo[]
  >([]);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [characterSelected, dispatchCharacterSelected] = useReducer(
    characterSelectReducer,
    []
  );

  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const getPaginatedStamps = useCallback(
    (page: number, limit: number) => {
      return filteredCache.slice(limit * (page - 1), limit * page);
    },
    [filteredCache]
  );

  useEffect(() => {
    if (stampsCache.length) {
      if (characterSelected.length) {
        const filtered = stampsCache.filter((s) =>
          characterSelected.includes(s.characterId1)
        );
        setFilteredCache(filtered);
      } else {
        setFilteredCache(stampsCache);
      }
      setStamps([]);
      setPage(0);
    }
  }, [characterSelected, stampsCache, setStamps, setPage, setFilteredCache]);

  useEffect(() => {
    setStamps((stamps) => [...stamps, ...getPaginatedStamps(page, limit)]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, stampsCache, getPaginatedStamps]);

  useEffect(() => {
    setIsReady(Boolean(stampsCache.length));
  }, [setIsReady, stampsCache]);

  const callback = (
    entries: IntersectionObserverEntry[],
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
    document.title = "Stamp List | Sekai Viewer";
  }, []);

  const getCharaName = useCallback(
    (charaId: number) => {
      const chara = charas.find((chara) => chara.id === charaId);
      if (chara?.firstName) {
        switch (contentTransMode) {
          case "original":
            return `${chara.firstName} ${chara.givenName}`;
          case "translated":
            return ["zh-CN", "zh-TW", "ko", "ja"].includes(assetI18n.language)
              ? `${assetI18n.t(
                  `character_name:${charaId}.firstName`
                )} ${assetI18n.t(`character_name:${charaId}.givenName`)}`
              : `${assetI18n.t(
                  `character_name:${charaId}.givenName`
                )} ${assetI18n.t(`character_name:${charaId}.firstName`)}`;
        }
      }
      return chara?.givenName;
    },
    [charas, contentTransMode, assetI18n]
  );

  const ListCard: React.FC<{ data?: IStampInfo }> = ({ data }) => {
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
      <Link
        href={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`}
        target="_blank"
        style={{ textDecoration: "none" }}
      >
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`}
            title={data.name}
          ></CardMedia>
          {/* <CardContent style={{ paddingBottom: "16px" }}>
            <Typography variant="subtitle1" className={classes.subheader}>
              {data.name}
            </Typography>
          </CardContent> */}
        </Card>
      </Link>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:gacha")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container justify="flex-end">
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </ButtonGroup>
        </Grid>
        <Collapse in={filterOpened}>
          <Grid container className={filterClasses.filterArea}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: filterClasses.filterCaption }}>
                  {t("filter:character.caption")}
                </Typography>
              </Grid>
              <Grid item container xs={12} md={9} spacing={1}>
                {Array.from({ length: 26 }).map((_, idx) => (
                  <Grid key={"chara-filter-" + idx} item>
                    <Chip
                      clickable
                      color={
                        characterSelected.includes(idx + 1)
                          ? "primary"
                          : "default"
                      }
                      avatar={
                        <Avatar
                          alt={getCharaName(idx + 1)}
                          src={
                            charaIcons[`CharaIcon${idx + 1}` as "CharaIcon1"]
                          }
                        />
                      }
                      label={getCharaName(idx + 1)}
                      onClick={() => {
                        if (characterSelected.includes(idx + 1)) {
                          dispatchCharacterSelected({
                            type: "remove",
                            payload: idx + 1,
                          });
                        } else {
                          dispatchCharacterSelected({
                            type: "add",
                            payload: idx + 1,
                          });
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
        {InfiniteScroll<IStampInfo>({
          viewComponent: ListCard,
          callback,
          data: stamps,
        })}
      </Container>
    </Fragment>
  );
};

export default StampList;
