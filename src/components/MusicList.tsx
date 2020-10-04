import { Card, CardHeader, CardMedia, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import Axios from "axios";
import React, { Fragment, useCallback, useEffect, useState } from "react";
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
    "max-width": "260px",
  },
}));

interface IMusicInfo {
  id: number;
  seq: number;
  releaseConditionId: number;
  categories: string[];
  title: string;
  lyricist: string;
  composer: string;
  arranger: string;
  dancerCount: number;
  selfDancerPosition: number;
  assetbundleName: string;
  liveTalkBackgroundAssetbundleName: string;
  publishedAt: number;
  liveStageId: number;
  fillerSec: number;
}

function getPaginitedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const MusicList: React.FC<any> = () => {
  const classes = useStyles();

  const [musics, setMusics] = useState<IMusicInfo[]>([]);

  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef,] = useRefState<number>(12);
  const [, totalMusicsRef, setTotalMusics] = useRefState<number>(0);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);

  useEffect(() => {
    document.title = "Card List | Sekai Viewer";
  }, []);

  const fetchMusics = useCallback(async () => {
    const { data: cards }: { data: IMusicInfo[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/musics.json"
    );
    return cards;
  }, []);

  useEffect(() => {
    fetchMusics().then((fcards) => {
      setTotalMusics(fcards.length);
      setMusics((cards) =>
        [...cards, ...getPaginitedMusics(fcards, page, limit)].sort(
          (a, b) => a.publishedAt - b.publishedAt
        )
      );
      setLastQueryFin(true);
    });
  }, [fetchMusics, page, limit, setLastQueryFin, setTotalMusics]);

  const callback = (entries: IntersectionObserverEntry[], setHasMore: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (entries[0].isIntersecting && lastQueryFinRef.current && (!totalMusicsRef.current || totalMusicsRef.current > pageRef.current * limitRef.current)) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (totalMusicsRef.current && totalMusicsRef.current <= pageRef.current * limitRef.current) {
      setHasMore(false)
    }
  }

  const listCard: React.FC<{ data: IMusicInfo }> = ({ data }) => {
    return (
      <Card className={classes.card}>
        <CardHeader
          title={data.title}
          titleTypographyProps={{
            classes: {
              root: classes.subheader
            }
          }}
        ></CardHeader>
        <CardMedia
          className={classes.media}
          image={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
          title={data.title}
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
      {InfiniteScroll<IMusicInfo>({
        viewComponent: listCard,
        loadingComponent: listLoading,
        callback,
        data: musics,
      })}
    </Fragment>
  );
};

export default MusicList;
