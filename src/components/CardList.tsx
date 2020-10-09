import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardMedia,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { Sort, ViewAgenda, ViewComfy } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Filter, ViewGrid } from "mdi-material-ui";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { ICardInfo, ICharaProfile } from "../types";
import { useCachedData, useRefState } from "../utils";
import { CardThumb } from "./subs/CardThumb";
import InfiniteScroll from "./subs/InfiniteScroll";

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
  agenda: {
    padding: "4% 4%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "300px",
    },
    // [theme.breakpoints.only("md")]: {
    //   maxWidth: "600px",
    // },
    maxWidth: "80%",
    margin: "auto",
    cursor: "pointer",
  },
  comfy: {
    padding: "4% 4%",
    cursor: "pointer",
  },
  comfyPrefix: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    [theme.breakpoints.down("md")]: {
      maxWidth: "150px",
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

function getPaginitedCards(cards: ICardInfo[], page: number, limit: number) {
  return cards.slice(limit * (page - 1), limit * page);
}

const CardList: React.FC<any> = (props) => {
  const classes = useStyles();
  const { push } = useHistory();
  const { path } = useRouteMatch();

  const [cards, setCards] = useState<ICardInfo[]>([]);
  const [cardsCache, cardsCacheRef] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<ICharaProfile>("gameCharacters");
  const [viewGridType, setViewGridType] = useState<string>(
    localStorage.getItem("card-list-grid-view-type") || "grid"
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

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
    if (cardsCache.length) {
      setCards((cards) => [
        ...cards,
        ...getPaginitedCards(cardsCache, page, limit),
      ]);
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, cardsCache]);

  const ListCard: { [key: string]: React.FC<{ data: ICardInfo }> } = {
    grid: ({ data }) => {
      return (
        <Card
          className={classes.card}
          onClick={() => push(path + "/" + data.id)}
        >
          <CardHeader
            title={data.prefix}
            titleTypographyProps={{
              variant: "subtitle1",
              classes: {
                root: classes.subheader,
              },
            }}
            subheader={getCharaName(charas, data.characterId)}
            subheaderTypographyProps={{
              variant: "body2",
              classes: {
                root: classes.subheader,
              },
            }}
          ></CardHeader>
          <CardMedia
            className={classes.media}
            image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_small/${data.assetbundleName}_rip/card_normal.webp`}
            title={data.prefix}
          ></CardMedia>
        </Card>
      );
    },
    agenda: ({ data }) => {
      return (
        <Paper
          className={classes.agenda}
          onClick={() => push(path + "/" + data.id)}
        >
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
              <Typography variant="body2">
                {getCharaName(charas, data.characterId)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      );
    },
    comfy: ({ data }) => {
      return (
        <Paper
          className={classes.comfy}
          onClick={() => push(path + "/" + data.id)}
        >
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
              <Typography variant="body2" align="center">
                {getCharaName(charas, data.characterId)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      );
    },
  };

  const ListLoading: React.FC<any> = () => {
    return (
      <Card className={classes.card}>
        <CardHeader
          title={<Skeleton variant="text" width="50%"></Skeleton>}
          subheader={<Skeleton variant="text" width="80%"></Skeleton>}
        ></CardHeader>
        <Skeleton variant="rect" height={130}></Skeleton>
      </Card>
    );
  };

  return (
    <Fragment>
      <Grid container justify="space-between">
        <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
          <Button
            variant={viewGridType === "grid" ? "outlined" : "contained"}
            onClick={() => {
              setViewGridType("grid");
              localStorage.setItem("card-list-grid-view-type", "grid");
            }}
          >
            <ViewGrid></ViewGrid>
          </Button>
          <Button
            variant={viewGridType === "agenda" ? "outlined" : "contained"}
            onClick={() => {
              setViewGridType("agenda");
              localStorage.setItem("card-list-grid-view-type", "agenda");
            }}
          >
            <ViewAgenda></ViewAgenda>
          </Button>
          <Button
            variant={viewGridType === "comfy" ? "outlined" : "contained"}
            onClick={() => {
              setViewGridType("comfy");
              localStorage.setItem("card-list-grid-view-type", "comfy");
            }}
          >
            <ViewComfy></ViewComfy>
          </Button>
        </ButtonGroup>
        <ButtonGroup color="primary" style={{ marginBottom: "1%" }} disabled>
          <Button variant="contained" size="medium">
            <Filter />
            <Sort />
          </Button>
        </ButtonGroup>
      </Grid>
      {InfiniteScroll<ICardInfo>({
        viewComponent: ListCard[viewGridType],
        loadingComponent: ListLoading,
        callback,
        data: cards,
        gridSize: {
          xs: 12,
          md: viewGridType === "grid" ? 4 : viewGridType === "agenda" ? 12 : 3,
        },
      })}
    </Fragment>
  );
};

export default CardList;
