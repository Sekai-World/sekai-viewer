import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Container,
  Collapse,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { Sort, SortOutlined, ViewAgenda, ViewComfy } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import {
  Filter,
  FilterOutline,
  ViewAgendaOutline,
  ViewComfyOutline,
  ViewGrid,
  ViewGridOutline,
} from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import {
  ContentTransModeType,
  ICardEpisode,
  ICardInfo,
  ICardRarity,
  ICharaProfile,
} from "../types";
import { useCachedData, useRefState } from "../utils";
import { CardThumb, CardThumbSkeleton } from "./subs/CardThumb";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useFilterStyles } from "../styles/filter";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down("md")]: {
      maxWidth: "200px",
    },
    maxWidth: "250px",
  },
  agendaWrapper: {
    display: "block",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
    // [theme.breakpoints.only("md")]: {
    //   maxWidth: "600px",
    // },
    maxWidth: "80%",
    margin: "auto",
    cursor: "pointer",
  },
  agenda: {
    padding: "4% 4%",
  },
  comfy: {
    padding: "4% 4%",
    cursor: "pointer",
  },
  comfyPrefix: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
    maxWidth: "210px",
  },
}));

function getCharaName(charas: ICharaProfile[], charaId: number) {
  const chara = charas.find((chara) => chara.id === charaId);
  if (chara?.firstName) {
    return `${chara.firstName} ${chara.givenName}`;
  }
  return chara?.givenName;
}

function getPaginatedCards(cards: ICardInfo[], page: number, limit: number) {
  return cards.slice(limit * (page - 1), limit * page);
}

function getMaxParam(
  card: ICardInfo,
  rarities: ICardRarity[],
  episodes: ICardEpisode[]
) {
  const rarity = rarities.find((rarity) => rarity.rarity === card.rarity)!;

  const maxLevel = rarity.trainingMaxLevel || rarity.maxLevel;

  let maxParam =
    card.cardParameters
      .filter((cp) => cp.cardLevel === maxLevel)
      .reduce((sum, cp) => {
        sum += cp.power;
        return sum;
      }, 0) +
    episodes
      .filter((episode) => episode.cardId === card.id)
      .reduce((sum, episode) => {
        sum += episode.power1BonusFixed;
        sum += episode.power2BonusFixed;
        sum += episode.power3BonusFixed;
        return sum;
      }, 0);
  if (card.rarity >= 3)
    maxParam +=
      card.specialTrainingPower1BonusFixed +
      card.specialTrainingPower2BonusFixed +
      card.specialTrainingPower3BonusFixed;

  return maxParam;
}

const CardList: React.FC<{ contentTransMode: ContentTransModeType }> = (
  props
) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const filterClasses = useFilterStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();

  const [cardsCache, cardsCacheRef] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<ICharaProfile>("gameCharacters");
  const [rarities] = useCachedData<ICardRarity>("cardRarities");
  const [episodes] = useCachedData<ICardEpisode>("cardEpisodes");

  const [cards, setCards] = useState<ICardInfo[]>([]);
  const [sortedCache, setSortedCache] = useState<ICardInfo[]>([]);
  const [viewGridType, setViewGridType] = useState<string>(
    localStorage.getItem("card-list-grid-view-type") || "grid"
  );
  const [page, pageRef, setPage] = useRefState<number>(0);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [sortType, setSortType] = useState<string>(
    localStorage.getItem("card-list-filter-sort-type") || "asc"
  );
  const [sortBy, setSortBy] = useState<string>(
    localStorage.getItem("card-list-filter-sort-by") || "id"
  );

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!cardsCacheRef.current.length ||
        cardsCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      cardsCacheRef.current.length &&
      cardsCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    document.title = "Card List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setIsReady(Boolean(cardsCache.length) && Boolean(charas.length));
  }, [setIsReady, cardsCache, charas]);

  useEffect(() => {
    if (cardsCache.length && rarities.length && episodes.length) {
      // temporarily sort cards cache
      switch (sortBy) {
        case "id":
        case "rarity":
        case "releaseAt":
          setSortedCache(
            [...cardsCache].sort((a, b) =>
              sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
            )
          );
          break;
        case "power":
          setSortedCache(
            [...cardsCache].sort((a, b) =>
              sortType === "asc"
                ? getMaxParam(a, rarities, episodes) -
                  getMaxParam(b, rarities, episodes)
                : getMaxParam(b, rarities, episodes) -
                  getMaxParam(a, rarities, episodes)
            )
          );
          break;
      }
      setCards([]);
      setPage(0);
    }
  }, [cardsCache, sortBy, sortType, setPage, rarities, episodes]);

  useEffect(() => {
    if (sortedCache.length) {
      setCards((cards) => [
        ...cards,
        ...getPaginatedCards(sortedCache, page, limit),
      ]);
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, sortedCache]);

  const ListCard: { [key: string]: React.FC<{ data?: ICardInfo }> } = {
    grid: ({ data }) => {
      if (!data) {
        // loading
        return (
          <Card className={classes.card}>
            <Skeleton variant="rect" className={classes.media}></Skeleton>
            <CardContent>
              <Typography variant="subtitle1" className={classes.subheader}>
                <Skeleton variant="text" width="90%"></Skeleton>
              </Typography>
              <Typography variant="body2" className={classes.subheader}>
                <Skeleton variant="text" width="30%"></Skeleton>
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
              image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_small/${data.assetbundleName}_rip/card_normal.webp`}
              title={data.prefix}
            ></CardMedia>
            <CardContent>
              <Typography variant="subtitle1" className={classes.subheader}>{data.prefix}</Typography>
              <Typography variant="body2" className={classes.subheader} color="textSecondary">
                {getCharaName(charas, data.characterId)}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      );
    },
    agenda: ({ data }) => {
      if (!data) {
        // loading
        return (
          <Box className={classes.agendaWrapper}>
            <Paper className={classes.agenda}>
              <Grid
                container
                alignItems="center"
                spacing={2}
                justify="space-between"
              >
                <Grid
                  item
                  xs={5}
                  md={4}
                  container
                  direction="row"
                  spacing={1}
                  justify="center"
                >
                  <Grid item xs={12} md={6}>
                    <CardThumbSkeleton></CardThumbSkeleton>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CardThumbSkeleton></CardThumbSkeleton>
                  </Grid>
                </Grid>
                <Grid item xs={6} md={7}>
                  <Typography variant="body1">
                    <Skeleton variant="text" width="70%"></Skeleton>
                  </Typography>
                  <Typography variant="body2">
                    <Skeleton variant="text" width="30%"></Skeleton>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );
      }
      return (
        <Link
          to={path + "/" + data.id}
          className={classes.agendaWrapper}
          style={{ textDecoration: "none" }}
        >
          <Paper className={classes.agenda}>
            <Grid
              container
              alignItems="center"
              spacing={2}
              justify="space-between"
            >
              <Grid
                item
                xs={5}
                md={4}
                container
                direction="row"
                spacing={1}
                justify="center"
              >
                <Grid item xs={12} md={6}>
                  <CardThumb id={data.id} />
                </Grid>
                {data.rarity >= 3 ? (
                  <Grid item xs={12} md={6}>
                    <CardThumb id={data.id} trained />
                  </Grid>
                ) : null}
              </Grid>
              <Grid item xs={6} md={7}>
                <Typography variant="body1">{data.prefix}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {getCharaName(charas, data.characterId)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Link>
      );
    },
    comfy: ({ data }) => {
      if (!data) {
        // loading
        return (
          <Paper className={classes.comfy}>
            <Grid
              container
              direction="column"
              alignItems="center"
              spacing={2}
              justify="space-between"
            >
              <Grid item container direction="row" spacing={1} justify="center">
                <Grid item xs={4}>
                  <CardThumbSkeleton></CardThumbSkeleton>
                </Grid>
                <Grid item xs={4}>
                  <CardThumbSkeleton></CardThumbSkeleton>
                </Grid>
              </Grid>
              <Grid item style={{ width: "100%" }}>
                <Typography classes={{ root: classes.comfyPrefix }} variant="body1">
                  <Skeleton variant="text" width="70%" style={{ margin: "0 auto" }}></Skeleton>
                </Typography>
                <Typography variant="body2">
                  <Skeleton variant="text" width="40%" style={{ margin: "0 auto" }}></Skeleton>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        );
      }
      return (
        <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
          <Paper className={classes.comfy}>
            <Grid
              container
              direction="column"
              alignItems="center"
              spacing={2}
              justify="space-between"
            >
              <Grid item container direction="row" spacing={1} justify="center">
                <Grid item xs={4}>
                  <CardThumb id={data.id} />
                </Grid>
                {data.rarity >= 3 ? (
                  <Grid item xs={4}>
                    <CardThumb id={data.id} trained />
                  </Grid>
                ) : null}
              </Grid>
              <Grid item>
                <Typography
                  classes={{ root: classes.comfyPrefix }}
                  variant="body1"
                  align="center"
                >
                  {data.prefix}
                </Typography>
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                >
                  {getCharaName(charas, data.characterId)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Link>
      );
    },
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:card")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container justify="space-between">
          <ButtonGroup style={{ marginBottom: "1%" }}>
            <Button
              // variant={viewGridType === "grid" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("grid");
                localStorage.setItem("card-list-grid-view-type", "grid");
              }}
              color={viewGridType === "grid" ? "primary" : "default"}
            >
              {viewGridType === "grid" ? (
                <ViewGrid></ViewGrid>
              ) : (
                <ViewGridOutline></ViewGridOutline>
              )}
            </Button>
            <Button
              // variant={viewGridType === "agenda" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("agenda");
                localStorage.setItem("card-list-grid-view-type", "agenda");
              }}
              color={viewGridType === "agenda" ? "primary" : "default"}
            >
              {viewGridType === "agenda" ? (
                <ViewAgenda></ViewAgenda>
              ) : (
                <ViewAgendaOutline></ViewAgendaOutline>
              )}
            </Button>
            <Button
              // variant={viewGridType === "comfy" ? "outlined" : "contained"}
              onClick={() => {
                setViewGridType("comfy");
                localStorage.setItem("card-list-grid-view-type", "comfy");
              }}
              color={viewGridType === "comfy" ? "primary" : "default"}
            >
              {viewGridType === "comfy" ? (
                <ViewComfy></ViewComfy>
              ) : (
                <ViewComfyOutline></ViewComfyOutline>
              )}
            </Button>
          </ButtonGroup>
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
              <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
                {filterOpened ? <Filter /> : <FilterOutline />}
                {filterOpened ? <Sort /> : <SortOutlined />}
              </Button>
            </ButtonGroup>
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
                  {t("filter:sort.caption")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <FormControl variant="outlined">
                  <Select
                    value={sortType}
                    onChange={(e) => {
                      setSortType(e.target.value as string);
                      localStorage.setItem(
                        "card-list-filter-sort-type",
                        e.target.value as string
                      );
                    }}
                  >
                    <MenuItem value="asc">
                      {t("filter:sort.ascending")}
                    </MenuItem>
                    <MenuItem value="desc">
                      {t("filter:sort.descending")}
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl variant="outlined">
                  <Select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as string);
                      localStorage.setItem(
                        "card-list-filter-sort-by",
                        e.target.value as string
                      );
                    }}
                  >
                    <MenuItem value="id">{t("common:id")}</MenuItem>
                    <MenuItem value="rarity">{t("common:rarity")}</MenuItem>
                    <MenuItem value="releaseAt">{t("common:startAt")}</MenuItem>
                    <MenuItem value="power">{t("card:power")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Collapse>
        {InfiniteScroll<ICardInfo>({
          viewComponent: ListCard[viewGridType],
          callback,
          data: cards,
          gridSize: {
            xs: 12,
            md:
              viewGridType === "grid" ? 4 : viewGridType === "agenda" ? 12 : 3,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default CardList;
