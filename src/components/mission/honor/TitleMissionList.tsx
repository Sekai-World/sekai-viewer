import {
  Button,
  ButtonGroup,
  Chip,
  Collapse,
  Container,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { Sort, SortOutlined } from "@material-ui/icons";
import { Filter, FilterOutline } from "mdi-material-ui";
import React, { useState, useEffect, Fragment, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { missionTypeReducer } from "../../../stores/reducers";
import { useInteractiveStyles } from "../../../styles/interactive";
import { useLayoutStyles } from "../../../styles/layout";
import { IHonorMission } from "../../../types";
import { useCachedData, useRefState } from "../../../utils";
import InfiniteScroll from "../../subs/InfiniteScroll";
import GridView from "./GridView";

type ViewGridType = "grid" | "agenda" | "comfy";

const ListCard: { [key: string]: React.FC<{ data?: IHonorMission }> } = {
  grid: GridView,
};

function getPaginatedHonorMissions(
  events: IHonorMission[],
  page: number,
  limit: number
) {
  return events.slice(limit * (page - 1), limit * page);
}

const HonorList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [honorMissionsCache] = useCachedData<IHonorMission>("honorMissions");

  const [honorMissions, setHonorMissions] = useState<IHonorMission[]>([]);

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, pageRef, setPage] = useRefState<number>(1);
  const [limit, limitRef] = useRefState<number>(12);
  const [, lastQueryFinRef, setLastQueryFin] = useRefState<boolean>(true);
  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [missionTypeSelected, dispatchMissionTypeSelected] = useReducer(
    missionTypeReducer,
    []
  );
  const [sortedCache, sortedCacheRef, setSortedCache] = useRefState<
    IHonorMission[]
  >([]);

  useEffect(() => {
    document.title = t("title:honorList");
  }, [t]);

  useEffect(() => {
    if (honorMissionsCache.length) {
      let result = [...honorMissionsCache];
      // do filter
      if (missionTypeSelected.length) {
        result = result.filter((c) =>
          missionTypeSelected.some((mt) => c.honorMissionType.includes(mt))
        );
      }
      setSortedCache(result);
      setHonorMissions([]);
      setPage(0);
    }
  }, [honorMissionsCache, setPage, setSortedCache, missionTypeSelected]);

  useEffect(() => {
    setHonorMissions((events) => [
      ...events,
      ...getPaginatedHonorMissions(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    setIsReady(Boolean(honorMissionsCache.length));
  }, [setIsReady, honorMissionsCache]);

  const callback = (
    entries: readonly IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!isReadyRef.current) return;
    if (
      entries[0].isIntersecting &&
      lastQueryFinRef.current &&
      (!sortedCacheRef.current.length ||
        sortedCacheRef.current.length > pageRef.current * limitRef.current)
    ) {
      setPage((page) => page + 1);
      setLastQueryFin(false);
    } else if (
      sortedCacheRef.current.length &&
      sortedCacheRef.current.length <= pageRef.current * limitRef.current
    ) {
      setHasMore(false);
    }
  };

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:mission.main")} - {t("common:mission.honor")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="flex-end">
          <ButtonGroup color="primary" style={{ marginBottom: "1%" }}>
            <Button size="medium" onClick={() => setFilterOpened((v) => !v)}>
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </ButtonGroup>
        </Grid>
        <Collapse in={filterOpened}>
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:missionType.caption")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={10} spacing={1}>
                  {[
                    "clear_live",
                    "player_rank",
                    "character_rank",
                    "unit_rank",
                    "collect",
                    "duplicate_card",
                    "area_item",
                    "login",
                    "master",
                    "multi_live",
                    "action_set",
                    "read_story",
                    "virtual_live",
                  ].map((tag) => (
                    <Grid key={"mission-type-" + tag} item>
                      <Chip
                        clickable
                        color={
                          missionTypeSelected.includes(tag)
                            ? "primary"
                            : "default"
                        }
                        label={t(`filter:missionType.${tag}`)}
                        onClick={() => {
                          if (missionTypeSelected.includes(tag)) {
                            dispatchMissionTypeSelected({
                              type: "remove",
                              payload: tag,
                            });
                          } else {
                            dispatchMissionTypeSelected({
                              type: "add",
                              payload: tag,
                            });
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        <InfiniteScroll<IHonorMission>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={honorMissions}
          gridSize={
            ({
              grid: {
                xs: 12,
                sm: 6,
                md: 4,
                lg: 3,
                xl: 2,
              },
              agenda: {
                xs: 12,
              },
              comfy: {
                xs: 12,
              },
            } as const)[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default HonorList;
