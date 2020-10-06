import { Card, CardHeader, CardMedia, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { ICardInfo, ICharaProfile } from "../types";
import { useCards, useCharas, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
  },
  card: {
    margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "250px",
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
  // const [cardsCache, setCardsCache] = useState<ICardInfo[]>([]);
  const [cardsCache, cardsCacheRef] = useCards();
  // const [charas, setCharas] = useState<ICharaProfile[]>([]);
  const [charas] = useCharas();
  // const [charasCache, setCharasCache] = useState<ICharaProfile[]>([]);
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  // const [, totalCardsRef, setTotalCards] = useRefState<number>(0);
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

  const ListCard: React.FC<{ data: ICardInfo }> = ({ data }) => {
    return (
      <Card className={classes.card} onClick={() => push(path + "/" + data.id)}>
        <CardHeader
          title={getCharaName(charas, data.characterId)}
          subheader={data.prefix}
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
  };

  const ListLoading: React.FC<any> = () => {
    return (
      <Card className={classes.card}>
        <CardHeader
          title={<Skeleton variant="text" width="50%"></Skeleton>}
          subheader={<Skeleton variant="text" width="80%"></Skeleton>}
          subheaderTypographyProps={{
            variant: "body2",
          }}
        ></CardHeader>
        <Skeleton variant="rect" height={130}></Skeleton>
      </Card>
    );
  };

  return (
    <Fragment>
      {InfiniteScroll<ICardInfo>({
        viewComponent: ListCard,
        loadingComponent: ListLoading,
        callback,
        data: cards,
      })}
    </Fragment>
  );
};

export default CardList;
