import {
  Card,
  CardHeader,
  CardMedia,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import Axios from "axios";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";
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

interface ICardInfo {
  id: number;
  seq: number;
  characterId: number;
  rarity: number;
  specialTrainingPower1BonusFixed: number;
  specialTrainingPower2BonusFixed: number;
  specialTrainingPower3BonusFixed: number;
  attr: string;
  supportUnit: string;
  skillId: string;
  cardSkillName: string;
  prefix: string;
  assetbundleName: string;
  gachaPhrase: string;
  flavorText: string;
  releaseAt: number;
  cardParameters: {
    id: number;
    cardId: number;
    cardLevel: number;
    cardParameterType: string;
    power: string;
  }[];
  specialTrainingCosts: {
    cardId: number;
    seq: number;
    cost: {
      resourceId: number;
      resourceType: string;
      resourceLevel: number;
      quantity: number;
    };
  }[];
  masterLessonAchieveResources: {
    releaseConditionId: number;
    cardId: number;
    masterRank: number;
    resources: {}[];
  }[];
}

interface ICharaProfile {
  id: number;
  seq: number;
  resourceId: number;
  firstName: string;
  givenName: string;
  firstNameRuby: string;
  givenNameRuby: string;
  gender: string;
  height: number;
  live2dHeightAdjustment: number;
  figure: string;
  breastSize: string;
  modelName: string;
  unit: string;
  supportUnitType: string;
}

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
  const [charas, setCharas] = useState<ICharaProfile[]>([]);
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef,] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, totalCardsRef, setTotalCards] = useRefState<number>(0);

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

  const callback = (entries: IntersectionObserverEntry[], setHasMore: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (entries[0].isIntersecting && lastQueryFinRef.current && (!totalCardsRef.current || totalCardsRef.current > pageRef.current * limitRef.current)) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (totalCardsRef.current && totalCardsRef.current <= pageRef.current * limitRef.current) {
      setHasMore(false)
    }
  }

  useEffect(() => {
    document.title = "Card List | Sekai Viewer";
  }, []);

  useEffect(() => {
    fetchCards().then((fcards) => {
      setTotalCards(fcards.length);
      setCards((cards) =>
        [...cards, ...getPaginitedCards(fcards, page, limit)].sort(
          (a, b) => a.id - b.id
        )
      );
      setLastQueryFin(true);
    });
    fetchCharas().then((fcharas) => setCharas(fcharas));
  }, [fetchCards, fetchCharas, page, limit, setLastQueryFin, setTotalCards]);

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
    )
  }

  return (
    <Fragment>
      {InfiniteScroll<ICardInfo>({
        viewComponent: listCard,
        loadingComponent: listLoading,
        callback,
        data: cards
      })}
    </Fragment>
  );
};

export default CardList;
