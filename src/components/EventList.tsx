import {
  Card,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
  Container,
  Grid,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { IEventInfo } from "../types";
import { useCachedData, useRefState } from "../utils";
import InfiniteScroll from "./subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import { useAssetI18n } from "../utils/i18n";
import { SettingContext } from "../context";
import { ContentTrans } from "./subs/ContentTrans";

type ViewGridType = "grid" | "agenda" | "comfy";

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

function getPaginatedEvents(events: IEventInfo[], page: number, limit: number) {
  return events.slice(limit * (page - 1), limit * page);
}

const EventList: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [events, setEvents] = useState<IEventInfo[]>([]);
  const [eventsCache, eventsCacheRef] = useCachedData<IEventInfo>("events");

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  useEffect(() => {
    document.title = t("title:eventList");
  }, [t]);

  useEffect(() => {
    setEvents((events) => [
      ...events,
      ...getPaginatedEvents(eventsCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, eventsCache]);

  useEffect(() => {
    setIsReady(Boolean(eventsCache.length));
  }, [setIsReady, eventsCache]);

  const callback = (
    entries: readonly IntersectionObserverEntry[],
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

  const ListCard: { [key: string]: React.FC<{ data?: IEventInfo }> } = {
    grid: ({ data }) => {
      if (!data) {
        // loading
        return (
          <Card className={classes.card}>
            <Skeleton variant="rect" className={classes.media}></Skeleton>
            <CardContent>
              <Typography variant="subtitle1" className={classes.header}>
                <Skeleton variant="text" width="90%"></Skeleton>
              </Typography>
              <Typography variant="body2">
                <Skeleton variant="text" width="40%"></Skeleton>
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
              image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/event/${data.assetbundleName}/logo_rip/logo.webp`}
              title={getTranslated(
                contentTransMode,
                `event_name:${data.id}`,
                data.name
              )}
            ></CardMedia>
            <CardContent style={{ paddingBottom: "16px" }}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <ContentTrans
                    mode={contentTransMode}
                    contentKey={`event_name:${data.id}`}
                    original={data.name}
                    originalProps={{
                      variant: "subtitle1",
                      className: classes.header,
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {t(`event:type.${data.eventType}`)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Link>
      );
    },
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:event")}
      </Typography>
      <Container className={layoutClasses.content}>
        {InfiniteScroll<IEventInfo>({
          viewComponent: ListCard[viewGridType],
          callback,
          data: events,
          gridSize: ({
            grid: {
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            },
            agenda: {
              xs: 12,
            },
            comfy: {
              xs: 12,
            },
          } as const)[viewGridType],
        })}
      </Container>
    </Fragment>
  );
};

export default EventList;
