import {
  Badge,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { RotateLeft, Sort, SortOutlined } from "@material-ui/icons";
import { Filter, FilterOutline } from "mdi-material-ui";
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
import {
  IHonorGroup,
  IHonorInfo,
  IHonorMission,
  IResourceBoxInfo,
} from "../../../types";
import { useCachedData } from "../../../utils";
import { ContentTrans } from "../../subs/ContentTrans";
import DegreeImage from "../../subs/DegreeImage";
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

const DetailDialog: React.FC<{
  resourceBoxId: number;
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  missionData?: IHonorMission;
}> = ({ resourceBoxId, open, onClose, missionData }) => {
  const { t } = useTranslation();

  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");
  const [honors] = useCachedData<IHonorInfo>("honors");
  const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

  const [honor, setHonor] = useState<IHonorInfo>();
  const [honorGroup, setHonorGroup] = useState<IHonorGroup>();

  useEffect(() => {
    if (resourceBoxes && honors && honorGroups && resourceBoxId) {
      const honor = honors.find(
        (honor) =>
          honor.id ===
          resourceBoxes
            .find(
              (resBox) =>
                resBox.resourceBoxPurpose === "mission_reward" &&
                resBox.id === resourceBoxId
            )!
            .details.find((detail) => detail.resourceType === "honor")!
            .resourceId
      )!;
      const honorGroup = honorGroups.find((hg) => hg.id === honor.groupId)!;
      setHonor(honor);
      setHonorGroup(honorGroup);
    }
  }, [honors, resourceBoxes, resourceBoxId, honorGroups]);

  return honor && honorGroup && missionData ? (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item container justify="center">
            <DegreeImage resourceBoxId={resourceBoxId} type="mission_reward" />
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("common:id")}
          </Typography>
          <Typography>{honor.id}</Typography>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("common:title")}
          </Typography>
          <ContentTrans
            contentKey={`honor_name:${honor.name}`}
            original={honor.name}
            originalProps={{
              align: "right",
            }}
            translatedProps={{
              align: "right",
            }}
          />
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={3} md={2}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:description")}
            </Typography>
          </Grid>
          <Grid item xs={8} md={9}>
            <ContentTrans
              contentKey={`honor_mission:${missionData.id}`}
              original={missionData.sentence}
              originalProps={{
                align: "right",
              }}
              translatedProps={{
                align: "right",
              }}
            />
          </Grid>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("mission:type.caption")}
          </Typography>
          <Typography>
            {t(`mission:type.${missionData.honorMissionType}`)}
          </Typography>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={3}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("mission:requirement")}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography align="right">{missionData.requirement}</Typography>
          </Grid>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("honor:honor_group")}
          </Typography>
          <ContentTrans
            contentKey={`honorGroup_name:${honorGroup.id}`}
            original={honorGroup.name}
            originalProps={{
              align: "right",
            }}
            translatedProps={{
              align: "right",
            }}
          />
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justify="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("common:rarity")}
          </Typography>
          <Typography>{t(`honor:rarity.${honor.honorRarity}`)}</Typography>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        {honor.levels.map((level) => (
          <Fragment>
            <Grid
              container
              direction="row"
              wrap="nowrap"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:level")}
              </Typography>
              <Typography>{level.level}</Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              container
              direction="row"
              wrap="nowrap"
              justify="space-between"
              alignItems="center"
            >
              <Grid item xs={3} md={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {t("common:description")}
                </Typography>
              </Grid>
              <Grid item xs={8} md={9}>
                <Typography align="right">{level.description}</Typography>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Fragment>
        ))}
      </DialogContent>
    </Dialog>
  ) : null;
};

const TitleMissionList: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const [honorMissionsCache] = useCachedData<IHonorMission>("honorMissions");

  const [honorMissions, setHonorMissions] = useState<IHonorMission[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [resourceBoxId, setResourceBoxId] = useState<number>(0);
  const [honorMission, setHonorMission] = useState<IHonorMission>();

  const [viewGridType] = useState<ViewGridType>("grid");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [lastQueryFin, setLastQueryFin] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [filterOpened, setFilterOpened] = useState<boolean>(false);
  const [missionTypeSelected, dispatchMissionTypeSelected] = useReducer(
    missionTypeReducer,
    JSON.parse(localStorage.getItem("mission-honor-list-filter-type") || "[]")
  );
  const [sortedCache, setSortedCache] = useState<IHonorMission[]>([]);

  useEffect(() => {
    document.title = t("title:honorList");
  }, [t]);

  useEffect(() => {
    if (honorMissionsCache && honorMissionsCache.length) {
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
    setIsReady(Boolean(honorMissionsCache && honorMissionsCache.length));
  }, [setIsReady, honorMissionsCache]);

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
        {t("common:mission.main")} - {t("common:mission.honor")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container justify="flex-end" style={{ marginBottom: "0.5rem" }}>
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
                justify="space-between"
                spacing={1}
              >
                <Grid item xs={12} md={1}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("filter:missionType.caption")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={11}>
                  <Grid container spacing={1}>
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
                          label={t(`mission:type.${tag}`)}
                          onClick={() => {
                            if (missionTypeSelected.includes(tag)) {
                              dispatchMissionTypeSelected({
                                type: "remove",
                                payload: tag,
                                storeName: "mission-honor-list-filter-type",
                              });
                            } else {
                              dispatchMissionTypeSelected({
                                type: "add",
                                payload: tag,
                                storeName: "mission-honor-list-filter-type",
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
                        storeName: "mission-honor-list-filter-type",
                      });
                    }}
                    startIcon={<RotateLeft />}
                  >
                    {t("common:reset")}
                  </Button>
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
          onComponentClick={(data) => {
            setHonorMission(data);
            setResourceBoxId(data.rewards[0].resourceBoxId);
            setOpen(true);
          }}
        />
      </Container>
      <DetailDialog
        missionData={honorMission}
        resourceBoxId={resourceBoxId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Fragment>
  );
};

export default TitleMissionList;
