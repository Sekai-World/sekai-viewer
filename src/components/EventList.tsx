import {
  Card,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
  Container,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { ContentTransModeType, IEventInfo } from "../types";
import { useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    [theme.breakpoints.down("md")]: {
      "max-width": "200px",
    },
    "max-width": "250px",
  },
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

function getPaginitedEvents(events: IEventInfo[], page: number, limit: number) {
  return events.slice(limit * (page - 1), limit * page);
}

const EventList: React.FC<{ contentTransMode: ContentTransModeType }> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { push } = useHistory();
  const { path } = useRouteMatch();
  const { t } = useTranslation();

  const [events, setEvents] = useState<IEventInfo[]>([]);
  const [eventsCache, eventsCacheRef] = useCachedData<IEventInfo>("events");

  const [viewGridType] = useState<string>(
    localStorage.getItem("event-list-grid-view-type") || "grid"
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  useEffect(() => {
    document.title = "Event List | Sekai Viewer";
  }, []);

  useEffect(() => {
    setEvents((events) => [
      ...events,
      ...getPaginitedEvents(eventsCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, eventsCache]);

  useEffect(() => {
    setIsReady(Boolean(eventsCache.length));
  }, [setIsReady, eventsCache]);

  const callback = (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!eventsCacheRef.current.length ||
        eventsCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      eventsCacheRef.current.length &&
      eventsCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  const ListCard: { [key: string]: React.FC<{ data: IEventInfo }> } = {
    grid: ({ data }) => {
      return (
        <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
          <Card
            className={classes.card}
            onClick={() => push(path + "/" + data.id)}
          >
            <CardMedia
              className={classes.media}
              image={`https://sekai-res.dnaroma.eu/file/sekai-assets/event/${data.assetbundleName}/logo_rip/logo.webp`}
              title={data.name}
            ></CardMedia>
            <CardContent>
              <Typography variant="subtitle1" className={classes.header}>
                {data.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t(`event:type.${data.eventType}`)}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      );
    },
  };

  const ListLoading: React.FC<any> = () => {
    return (
      <Card className={classes.card}>
        <Skeleton variant="rect" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
            <Skeleton variant="text" width="50%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="80%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:event")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        {InfiniteScroll<IEventInfo>({
          viewComponent: ListCard[viewGridType],
          loadingComponent: ListLoading,
          callback,
          data: events,
          gridSize: {
            xs: 12,
            md:
              viewGridType === "grid" ? 4 : viewGridType === "agenda" ? 12 : 12,
          },
        })}
      </Container>
    </Fragment>
  );
};

export default EventList;
