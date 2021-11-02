import {
  Badge,
  Button,
  Chip,
  Collapse,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  RotateLeft,
  Sort,
  SortOutlined,
  FilterAlt as Filter,
  FilterAltOutlined as FilterOutline,
} from "@mui/icons-material";
import React, {
  useState,
  useEffect,
  Fragment,
  useReducer,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { missionTypeReducer } from "../../../stores/reducers";
import { useInteractiveStyles } from "../../../styles/interactive";
import { useLayoutStyles } from "../../../styles/layout";
import { IBeginnerMission } from "../../../types";
import { useCachedData } from "../../../utils";
import InfiniteScroll from "../../subs/InfiniteScroll";
import GridView from "./GridView";

type ViewGridType = "grid" | "agenda" | "comfy";

const ListCard: { [key: string]: React.FC<{ data?: IBeginnerMission }> } = {
  grid: GridView,
};

function getPaginatedHonorMissions(
  events: IBeginnerMission[],
  page: number,
  limit: number
) {
  return events.slice(limit * (page - 1), limit * page);
}

const BeginnerMissionList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [beginnerMissionsCache] =
    useCachedData<IBeginnerMission>("beginnerMissions");

  const [beginnerMissions, setBeginnerMissions] = useState<IBeginnerMission[]>(
    []
  );

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [missionTypeSelected, dispatchMissionTypeSelected] = useReducer(
    missionTypeReducer,
    []
  );
  const [sortedCache, setSortedCache] = useState<IBeginnerMission[]>([]);

  useEffect(() => {
    document.title = t("title:beginnerMissionList");
  }, [t]);

  useEffect(() => {
    if (beginnerMissionsCache && beginnerMissionsCache.length) {
      let result = [...beginnerMissionsCache];
      // do filter
      if (missionTypeSelected.length) {
        result = result.filter((c) =>
          missionTypeSelected.some((mt) => c.beginnerMissionType.includes(mt))
        );
      }
      setSortedCache(result);
      setBeginnerMissions([]);
      setPage(0);
    }
  }, [beginnerMissionsCache, setPage, setSortedCache, missionTypeSelected]);

  useEffect(() => {
    setBeginnerMissions((events) => [
      ...events,
      ...getPaginatedHonorMissions(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    setIsReady(Boolean(beginnerMissionsCache && beginnerMissionsCache.length));
  }, [setIsReady, beginnerMissionsCache]);

  const callback = useCallback(
    (
      entries: readonly IntersectionObserverEntry[],
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!isReady) return;
      if (
        entries[0].isIntersecting &&
        lastQueryFin &&
        (!sortedCache.length || sortedCache.length > page * limit)
      ) {
        setPage((page) => page + 1);
        setLastQueryFin(false);
      } else if (sortedCache.length && sortedCache.length <= page * limit) {
        setHasMore(false);
      }
    },
    [isReady, lastQueryFin, limit, page, sortedCache.length]
  );

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:mission.main")} - {t("common:mission.beginner")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid
          container
          justifyContent="flex-end"
          style={{ marginBottom: "0.5rem" }}
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={!missionTypeSelected.length}
          >
            <Button
              variant="outlined"
              onClick={() => setFilterOpened((v) => !v)}
            >
              {filterOpened ? <Filter /> : <FilterOutline />}
              {filterOpened ? <Sort /> : <SortOutlined />}
            </Button>
          </Badge>
        </Grid>
        <Collapse in={filterOpened}>
          <Paper className={interactiveClasses.container}>
            <Grid container direction="column" spacing={1}>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:missionType.caption")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {["make", "clear", "read", "buy", "achieve"].map((tag) => (
                      <Grid key={"mission-type-" + tag} item>
                        <Chip
                          clickable
                          color={
                            missionTypeSelected.includes(tag)
                              ? "primary"
                              : "default"
                          }
                          label={t(`mission:type.${tag}`)}
                          onClick={() => {
                            if (missionTypeSelected.includes(tag)) {
                              dispatchMissionTypeSelected({
                                type: "remove",
                                payload: tag,
                                storeName: "mission-beginner-list-filter-type",
                              });
                            } else {
                              dispatchMissionTypeSelected({
                                type: "add",
                                payload: tag,
                                storeName: "mission-beginner-list-filter-type",
                              });
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid
                  item
                  container
                  xs={12}
                  alignItems="center"
                  // justify="space-between"
                  spacing={1}
                >
                  <Grid item xs={false} md={1}></Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!missionTypeSelected.length}
                      onClick={() => {
                        dispatchMissionTypeSelected({
                          type: "reset",
                          payload: "",
                          storeName: "mission-beginner-list-filter-type",
                        });
                      }}
                      startIcon={<RotateLeft />}
                    >
                      {t("common:reset")}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        <InfiniteScroll<IBeginnerMission>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={beginnerMissions}
          gridSize={
            (
              {
                grid: {
                  xs: 12,
                  md: 6,
                },
                agenda: {
                  xs: 12,
                },
                comfy: {
                  xs: 12,
                },
              } as const
            )[viewGridType]
          }
        />
      </Container>
    </Fragment>
  );
};

export default BeginnerMissionList;
