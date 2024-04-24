import {
  Badge,
  Button,
  Chip,
  Collapse,
  FormControl,
  Grid,
  MenuItem,
  Select,
  ToggleButton,
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
import { INormalMission } from "../../../types.d";
import { useCachedData, useLocalStorage, useToggle } from "../../../utils";
import InfiniteScroll from "../../../components/helpers/InfiniteScroll";
import GridView from "./GridView";
import TypographyHeader from "../../../components/styled/TypographyHeader";
import ContainerContent from "../../../components/styled/ContainerContent";
import PaperContainer from "../../../components/styled/PaperContainer";
import TypographyCaption from "../../../components/styled/TypographyCaption";

type ViewGridType = "grid" | "agenda" | "comfy";

const ListCard: { [key: string]: React.FC<{ data?: INormalMission }> } = {
  grid: GridView,
};

function getPaginatedHonorMissions(
  events: INormalMission[],
  page: number,
  limit: number
) {
  return events.slice(limit * (page - 1), limit * page);
}

const NormalMissionList: React.FC<unknown> = () => {
  const { t } = useTranslation();

  const [normalMissionsCache] = useCachedData<INormalMission>("normalMissions");

  const [normalMissions, setNormalMissions] = useState<INormalMission[]>([]);

  const [viewGridType] = useState<ViewGridType>(
    (localStorage.getItem("event-list-grid-view-type") ||
      "grid") as ViewGridType
  );
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [missionTypeSelected, dispatchMissionTypeSelected] = useReducer(
    missionTypeReducer,
    JSON.parse(localStorage.getItem("mission-normal-list-filter-type") || "[]")
  );
  const [sortedCache, setSortedCache] = useState<INormalMission[]>([]);

  const [sortType, setSortType] = useLocalStorage<string>(
    "mission-normal-list-filter-sort-type",
    "asc"
  );
  const [sortBy, setSortBy] = useLocalStorage<string>(
    "mission-normal-list-filter-sort-by",
    "id"
  );

  useEffect(() => {
    document.title = t("title:normalMissionList");
  }, [t]);

  useEffect(() => {
    if (normalMissionsCache?.length) {
      let result = [...normalMissionsCache];
      // do filter
      if (missionTypeSelected.length) {
        result = result.filter((c) =>
          missionTypeSelected.some((mt) => c.normalMissionType.includes(mt))
        );
      }
      switch (sortBy) {
        case "id":
        case "seq":
          result = result.sort((a, b) =>
            sortType === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
          );
          break;
      }
      setSortedCache(result);
      setNormalMissions([]);
      setPage(0);
    }
  }, [missionTypeSelected, normalMissionsCache, sortBy, sortType]);

  useEffect(() => {
    setNormalMissions((events) => [
      ...events,
      ...getPaginatedHonorMissions(sortedCache, page, limit),
    ]);
    setLastQueryFin(true);
  }, [page, limit, setLastQueryFin, sortedCache]);

  useEffect(() => {
    setIsReady(!!normalMissionsCache?.length);
  }, [normalMissionsCache?.length]);

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
      <TypographyHeader>
        {t("common:mission.main")} - {t("common:mission.normal")}
      </TypographyHeader>
      <ContainerContent>
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
            <ToggleButton
              value=""
              color="primary"
              selected={filterOpen}
              onClick={() => toggleFilterOpen()}
            >
              {filterOpen ? <Filter /> : <FilterOutline />}
              {filterOpen ? <Sort /> : <SortOutlined />}
            </ToggleButton>
          </Badge>
        </Grid>
        <Collapse in={filterOpen}>
          <PaperContainer>
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
                  <TypographyCaption>
                    {t("filter:missionType.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    {[
                      "make",
                      "skill_level",
                      "master_rank",
                      "character_rank",
                      "set_honor",
                      "clear",
                      "read",
                      "use",
                      "buy",
                      "inherit",
                    ].map((tag) => (
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
                                storeName: "mission-normal-list-filter-type",
                              });
                            } else {
                              dispatchMissionTypeSelected({
                                type: "add",
                                payload: tag,
                                storeName: "mission-normal-list-filter-type",
                              });
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <TypographyCaption>
                    {t("filter:sort.caption")}
                  </TypographyCaption>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={sortType}
                          onChange={(e) => {
                            setSortType(e.target.value as string);
                          }}
                          style={{ minWidth: "100px" }}
                        >
                          <MenuItem value="asc">
                            {t("filter:sort.ascending")}
                          </MenuItem>
                          <MenuItem value="desc">
                            {t("filter:sort.descending")}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item>
                      <FormControl>
                        <Select
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value as string);
                          }}
                          style={{ minWidth: "100px" }}
                        >
                          <MenuItem value="id">{t("common:id")}</MenuItem>
                          <MenuItem value="seq">
                            {t("common:sequence")}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
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
                        storeName: "mission-normal-list-filter-type",
                      });
                    }}
                    startIcon={<RotateLeft />}
                  >
                    {t("common:reset")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </PaperContainer>
        </Collapse>
        <InfiniteScroll<INormalMission>
          ViewComponent={ListCard[viewGridType]}
          callback={callback}
          data={normalMissions}
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
      </ContainerContent>
    </Fragment>
  );
};

export default NormalMissionList;
