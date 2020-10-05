import { Card, CardHeader, CardMedia, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import Axios from "axios";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { ICardInfo, ICharaProfile } from "../types";
import { useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
  },
  card: {
    margin: theme.spacing(0.5),
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "180px",
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
  const [cards, setCards] = useState<ICardInfo[]>([]);
  const [cardsCache, setCardsCache] = useState<ICardInfo[]>([]);
  const [charas, setCharas] = useState<ICharaProfile[]>([]);
  // const [charasCache, setCharasCache] = useState<ICharaProfile[]>([]);
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, totalCardsRef, setTotalCards] = useRefState<number>(0);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const fetchCards = useCallback(async () => {
    const { data: cards }: { data: ICardInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/cards.json"
    );
    return cards;
  }, []);

  const fetchCharas = useCallback(async () => {
    const { data: charas }: { data: ICharaProfile[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/gameCharacters.json"
    );
    return charas;
  }, []);

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!totalCardsRef.current ||
        totalCardsRef.current > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      totalCardsRef.current &&
      totalCardsRef.current <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    document.title = "Card List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setIsReady(false);
    Promise.all([
      fetchCards().then((fcards) => {
        setTotalCards(fcards.length);
        setCardsCache(fcards.sort(
          (a, b) => a.id - b.id
        ));
      }),
      fetchCharas().then((fcharas) => setCharas(fcharas))
    ]).then(() => setIsReady(true));
  }, [fetchCharas, fetchCards, setTotalCards, setIsReady]);

  useEffect(() => {
    if (cardsCache.length) {
      setCards((cards) =>
        [...cards, ...getPaginitedCards(cardsCache, page, limit)]
      );
      setLastQueryFin(true);
    }
  }, [page, limit, setLastQueryFin, setTotalCards, cardsCache]);

  const listCard: React.FC<{ data: ICardInfo }> = ({ data }) => {
    return (
      <Card className={classes.card}>
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
          image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${data.assetbundleName}_rip/card_normal.webp`}
          title={data.prefix}
        ></CardMedia>
      </Card>
    );
  };

  const listLoading: React.FC<any> = () => {
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
        viewComponent: listCard,
        loadingComponent: listLoading,
        callback,
        data: cards,
      })}
    </Fragment>
  );
};

export default CardList;
