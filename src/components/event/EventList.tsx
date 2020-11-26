import { Typography, Container } from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import React, { Fragment, useEffect, useState } from "react";
import { IEventInfo } from "../../types";
import { useCachedData, useRefState } from "../../utils";
import InfiniteScroll from "../subs/InfiniteScroll";

import { useTranslation } from "react-i18next";
import GridView from "./GridView";

type ViewGridType = "grid" | "agenda" | "comfy";

function getPaginatedEvents(events: IEventInfo[], page: number, limit: number) {
  return events.slice(limit * (page - 1), limit * page);
}

const ListCard: { [key: string]: React.FC<{ data?: IEventInfo }> } = {
  grid: GridView,
};

const EventList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();

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

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:event")}
      </Typography>
      <Container className={layoutClasses.content}>
        {InfiniteScroll<IEventInfo>({
          ViewComponent: ListCard[viewGridType],
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
