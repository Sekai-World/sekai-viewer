import { Card, CardHeader, CardMedia, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { IMusicInfo } from "../types";
import { useMusics, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
  },
  card: {
    margin: theme.spacing(0.5),
    cursor: 'pointer',
  },
  header: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    [theme.breakpoints.down('md')]: {
      "max-width": "200px",
    },
    "max-width": "250px",
  },
}));

function getPaginitedMusics(musics: IMusicInfo[], page: number, limit: number) {
  return musics.slice(limit * (page - 1), limit * page);
}

const MusicList: React.FC<any> = () => {
  const classes = useStyles();
  const { push } = useHistory();
  const { path } = useRouteMatch();

  const [musics, setMusics] = useState<IMusicInfo[]>([]);
  // const [musicsCache, setMusicsCache] = useState<IMusicInfo[]>([]);
  const [musicsCache, musicsCacheRef] = useMusics();

  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  // const [, totalMusicsRef, setTotalMusics] = useRefState<number>(0);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  useEffect(() => {
    document.title = "Music List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setMusics((musics) =>
      [...musics, ...getPaginitedMusics(musicsCache, page, limit)]
    );
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, musicsCache])

  useEffect(() => {
    setIsReady(Boolean(musicsCache.length))
  }, [setIsReady, musicsCache]);

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!musicsCacheRef.current.length ||
        musicsCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      musicsCacheRef.current.length &&
      musicsCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  const getSubHeader = (name:string) => {
    switch (name) {
      case 'mv': return '3D MV'
      case 'original': return 'Original MV'
      case 'sekai': return 'Sekai MV'
      case 'image': return 'Static Image'
      default:
        return name;
    }
  }

  const ListCard: React.FC<{ data: IMusicInfo }> = ({ data }) => {
    console.log(data.categories[0])
    return (
      <Card className={classes.card} onClick={() => push(path + '/' + data.id)}>
        <CardHeader
          title={data.title}
          titleTypographyProps={{
            classes: {
              root: classes.header,
            },
          }}
          subheader={getSubHeader(data.categories[0])}
        ></CardHeader>
        <CardMedia
          className={classes.media}
          image={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`}
          title={data.title}
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
        ></CardHeader>
        <Skeleton variant="rect" height={130}></Skeleton>
      </Card>
    );
  };

  return (
    <Fragment>
      {InfiniteScroll<IMusicInfo>({
        viewComponent: ListCard,
        loadingComponent: ListLoading,
        callback,
        data: musics,
      })}
    </Fragment>
  );
};

export default MusicList;
