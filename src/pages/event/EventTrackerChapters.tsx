import { TabContext } from "@mui/lab";
import {
  Alert,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Slider,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CronJob } from "cron";
import { observer } from "mobx-react-lite";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedCallback } from "use-debounce";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyHeader from "../../components/styled/TypographyHeader";
import { useRootStore } from "../../stores/root";
import {
  EventRankingResponse,
  IWorldBloom,
  IWorldBloomChapterRankingRewardRange,
} from "../../types";
import { useToggle } from "../../utils";
import { useEventTrackerAPI } from "../../utils/eventTracker";
import { HistoryMobileRow, LiveMobileRow } from "./EventTrackerMobileRow";
import { HistoryRow, LiveRow } from "./EventTrackerTableRow";

const EventTackerChapters: React.FC<{
  eventId: number;
  chapters: IWorldBloom[];
  chapterRankingRewards?: IWorldBloomChapterRankingRewardRange[];
}> = observer(({ eventId, chapters, chapterRankingRewards }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { region } = useRootStore();
  const {
    getChapterLive,
    getEventChapterTimePoints,
    getEventChapterLastRankings,
    getEventChapterRankingsByTimestamp,
  } = useEventTrackerAPI(region);

  const fullRank = useMemo(
    () => [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500,
      1000, 2000, 3000, 4000, 5000, 7000, 10000, 20000, 30000, 40000, 50000,
      70000, 100000,
    ],
    []
  );

  const critialRank = useMemo(
    () => [1, 2, 3, 10, 100, 1000, 5000, 10000, 50000, 100000],
    []
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isFetching, setIsFetching] = useState(false);
  const [worldBloomChapterNo, setWorldBloomChapterNo] = useState<string>("");

  const [rtRanking, setRtRanking] = useState<EventRankingResponse[]>([]);
  const [rtTime, setRtTime] = useState<Date>();
  const [historyRanking, setHistoryRanking] = useState<EventRankingResponse[]>(
    []
  );
  const [historyTime, setHistoryTime] = useState<Date>();
  const [nextRefreshTime, setNextRefreshTime] = useState<moment.Moment>();
  const [refreshCron, setRefreshCron] = useState<CronJob>();
  const [isFullRank, toggleIsFullRank] = useToggle(false);
  const [isTimeTravel, toggleIsTimeTravel] = useToggle(false);
  const [eventDuration, setEventDuration] = useState(0);
  const [timePoints, setTimePoints] = useState<Date[]>([]);
  const [sliderTime, setSliderTime] = useState<Date>();
  const [sliderDefaultTime, setSliderDefaultTime] = useState<Date>();
  const [sliderTimeRanking, setSliderTimeRanking] = useState<
    EventRankingResponse[]
  >([]);
  const [fetchingTimePoints, toggleFetchingTimePoints] = useToggle(false);

  const currChapter = useMemo(() => {
    if (!worldBloomChapterNo) return;
    return chapters.find(
      (chapter) => chapter.chapterNo.toString() === worldBloomChapterNo
    );
  }, [worldBloomChapterNo, chapters]);

  const isCurrChapterAggregated = useMemo(() => {
    if (currChapter) {
      const now = new Date();
      return now > new Date(currChapter.aggregateAt);
    }
    return false;
  }, [currChapter]);

  const isCurrChapterStarted = useMemo(() => {
    if (currChapter) {
      const now = new Date();
      return now >= new Date(currChapter.chapterStartAt);
    }
    return false;
  }, [currChapter]);

  const isCurrChapterLive = useMemo(() => {
    if (currChapter) {
      const now = new Date();
      return (
        now >= new Date(currChapter.chapterStartAt) &&
        now < new Date(currChapter.aggregateAt)
      );
    }
    return false;
  }, [currChapter]);

  const refreshChapterRealtimeData = useCallback(
    async (charaId: number) => {
      setIsFetching(true);
      try {
        const data = await getChapterLive(charaId);
        setRtRanking(data);
        setRtTime(new Date(data[0].timestamp));
      } finally {
        setIsFetching(false);
      }
    },
    [getChapterLive]
  );

  const getHistoryData = useCallback(
    async (eventId: number, charaId: number) => {
      setIsFetching(true);
      const data = await getEventChapterLastRankings(eventId, charaId);

      if (!!data) {
        setHistoryTime(new Date(data[0].timestamp));
        setHistoryRanking(data);
      } else {
        setHistoryTime(undefined);
        setHistoryRanking([]);
      }

      setIsFetching(false);
    },
    [getEventChapterLastRankings]
  );

  const fetchChapterRankings = useCallback(
    async (eventId: number, currChapter?: IWorldBloom) => {
      if (!currChapter) return;
      setRtRanking([]);
      setRtTime(undefined);
      setHistoryRanking([]);
      setHistoryTime(undefined);
      setNextRefreshTime(undefined);
      setTimePoints([]);
      setSliderTime(undefined);
      setSliderDefaultTime(undefined);
      setSliderTimeRanking([]);

      // real time data
      if (isCurrChapterLive) {
        // get realtime data from live endpoint
        const cron = new CronJob(
          "10 */3 * * * *",
          () => {
            const currentTime = Date.now();
            if (currentTime >= currChapter.aggregateAt) cron.stop();
            else {
              refreshChapterRealtimeData(currChapter.gameCharacterId);
              setEventDuration(currentTime - currChapter.chapterStartAt);
              setNextRefreshTime(cron.nextDate());
            }
          },
          null,
          false,
          undefined,
          undefined,
          true
        );
        setRefreshCron(cron);
        cron.start();
      } else if (isCurrChapterAggregated) {
        getHistoryData(eventId, currChapter.gameCharacterId);
        setEventDuration(currChapter.aggregateAt - currChapter.chapterStartAt);
      }
    },
    [
      getHistoryData,
      isCurrChapterAggregated,
      isCurrChapterLive,
      refreshChapterRealtimeData,
    ]
  );

  useEffect(() => {
    fetchChapterRankings(eventId, currChapter);

    return () => {
      if (refreshCron) refreshCron.stop();
    };
  }, [currChapter, eventId, fetchChapterRankings, refreshCron]);

  useEffect(() => {
    if (chapters.length) {
      // Set the initial chapter number by comparing current time with chapter start times and end times
      const now = new Date();
      const initialChapter = chapters.find((chapter) => {
        const startTime = new Date(chapter.chapterStartAt);
        const endTime = new Date(chapter.chapterEndAt);
        return now >= startTime && now <= endTime;
      });

      if (initialChapter) {
        setWorldBloomChapterNo(initialChapter.chapterNo.toString());
      } else {
        // If no chapter is active, set to the last chapter by default
        setWorldBloomChapterNo(
          chapters[chapters.length - 1].chapterNo.toString()
        );
      }
    }

    return () => {
      setWorldBloomChapterNo("");
    };
  }, [chapters]);

  const handleTimeTravelChange = useCallback(
    async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (checked && !timePoints.length && currChapter) {
        toggleFetchingTimePoints();
        const tps = (
          await getEventChapterTimePoints(eventId, currChapter.gameCharacterId)
        ).data.map((dateString) => new Date(dateString));
        setTimePoints(tps);
        setSliderTime(tps[tps.length - 1]);
        setSliderDefaultTime(tps[tps.length - 1]);
        setSliderTimeRanking(
          (
            await getEventChapterRankingsByTimestamp(
              eventId,
              currChapter.gameCharacterId,
              tps[tps.length - 1]
            )
          ).data.eventRankings
        );
        toggleFetchingTimePoints();
      }
      toggleIsTimeTravel();
    },
    [
      timePoints.length,
      currChapter,
      toggleIsTimeTravel,
      toggleFetchingTimePoints,
      getEventChapterTimePoints,
      eventId,
      getEventChapterRankingsByTimestamp,
    ]
  );

  const handleSliderChange = useDebouncedCallback(
    async (_, value: number | number[]) => {
      if (!currChapter || !value || fetchingTimePoints) return;
      toggleFetchingTimePoints();
      setSliderTime(new Date(value as number));
      setSliderTimeRanking(
        (
          await getEventChapterRankingsByTimestamp(
            eventId,
            currChapter.gameCharacterId,
            new Date(value as number)
          )
        ).data.eventRankings
      );
      toggleFetchingTimePoints();
    },
    200
  );

  return (
    <Fragment>
      <TypographyHeader>
        {t("event:worldBloom.ranking")}{" "}
        {isFetching && <CircularProgress size="24px" />}
      </TypographyHeader>
      <ContainerContent>
        <TabContext value={worldBloomChapterNo}>
          <PaperContainer>
            <Tabs
              value={worldBloomChapterNo}
              onChange={(e, v) => setWorldBloomChapterNo(v)}
              variant="scrollable"
              scrollButtons
            >
              {chapters.map((chapter) => (
                <Tab
                  label={t("event:worldBloom.chapter", {
                    chapterNo: chapter.chapterNo,
                  })}
                  value={chapter.chapterNo.toString()}
                  key={chapter.chapterNo}
                />
              ))}
            </Tabs>
          </PaperContainer>
          {!!currChapter && !isFetching && (
            <ContainerContent>
              {isCurrChapterStarted ? (
                <Typography variant="h6">
                  {t("event:realtime")}{" "}
                  {isTimeTravel
                    ? sliderTime?.toLocaleString()
                    : (rtTime || historyTime || new Date(0)).toLocaleString()}
                </Typography>
              ) : (
                <Typography variant="h6" color="textSecondary">
                  {t("event:worldBloom.chapterNotStarted")}
                </Typography>
              )}
              {!!nextRefreshTime && (
                <Typography variant="body2" color="textSecondary">
                  {t("event:nextfetch")}: {nextRefreshTime.fromNow()}
                </Typography>
              )}
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isFullRank}
                      onChange={() => toggleIsFullRank()}
                    />
                  }
                  label={t("event:tracker.show_all_rank") as string}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTimeTravel}
                      onChange={handleTimeTravelChange}
                      disabled={fetchingTimePoints}
                    />
                  }
                  label={
                    <Typography>
                      {t("event:tracker.time_travel_enabled")}{" "}
                      {fetchingTimePoints && <CircularProgress size="12px" />}
                    </Typography>
                  }
                />
              </FormGroup>
              {isTimeTravel && (
                <Slider
                  step={null}
                  min={timePoints[0].getTime()}
                  max={timePoints[timePoints.length - 1].getTime()}
                  marks={timePoints.map((tp) => ({ value: tp.getTime() }))}
                  disabled={fetchingTimePoints}
                  defaultValue={sliderDefaultTime?.getTime()}
                  onChange={handleSliderChange}
                />
              )}
              {region === "jp" &&
                !isTimeTravel &&
                !!rtRanking.length &&
                !!rtTime && (
                  <Alert severity="info" sx={{ margin: theme.spacing(1, 0) }}>
                    <Typography>
                      {t("event:tracker.tooltip.get_prediction")}
                    </Typography>
                  </Alert>
                )}
              {!isTimeTravel &&
                !!rtRanking.length &&
                !!rtTime &&
                (isMobile ? (
                  <Grid container spacing={1}>
                    {(isFullRank ? fullRank : critialRank).map((rank) => (
                      <Grid key={rank} item xs={12}>
                        <LiveMobileRow
                          rankingData={
                            rtRanking.find((elem) => elem.rank === rank) || {
                              id: -1,
                              eventId,
                              timestamp: "0",
                              rank,
                              score: 0,
                              userId: "0",
                              userName: "N/A",
                            }
                          }
                          charaId={currChapter.gameCharacterId}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell align="center">
                            {t("event:ranking")}
                          </TableCell>
                          <TableCell align="center">
                            {t("event:rankingTable.head.userProfile")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.score")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.speed_per_hour")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.prediction")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(isFullRank ? fullRank : critialRank).map((rank) => (
                          <LiveRow
                            key={rank}
                            rankingReward={chapterRankingRewards?.find(
                              (r) =>
                                r.toRank === rank &&
                                r.gameCharacterId ===
                                  currChapter.gameCharacterId
                            )}
                            rankingData={
                              rtRanking.find((elem) => elem.rank === rank) || {
                                id: -1,
                                eventId,
                                timestamp: "0",
                                rank,
                                score: 0,
                                userId: "0",
                                userName: "N/A",
                              }
                            }
                            eventDuration={eventDuration}
                            noPred
                            charaId={currChapter.gameCharacterId}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ))}
              {!isTimeTravel &&
                !!historyRanking.length &&
                !!historyTime &&
                (isMobile ? (
                  <Grid container spacing={1}>
                    {(isFullRank ? fullRank : critialRank).map((rank) => (
                      <Grid key={rank} item xs={12}>
                        <HistoryMobileRow
                          rankingData={
                            historyRanking.find(
                              (elem) => elem.rank === rank
                            ) || {
                              id: -1,
                              eventId,
                              timestamp: "0",
                              rank,
                              score: 0,
                              userId: "0",
                              userName: "N/A",
                            }
                          }
                          eventId={eventId}
                          charaId={currChapter.gameCharacterId}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell align="center">
                            {t("event:ranking")}
                          </TableCell>
                          <TableCell align="center">
                            {t("event:rankingTable.head.userProfile")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.score")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.speed_per_hour")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(isFullRank ? fullRank : critialRank).map((rank) => (
                          <HistoryRow
                            key={rank}
                            rankingReward={chapterRankingRewards?.find(
                              (r) =>
                                r.toRank === rank &&
                                r.gameCharacterId ===
                                  currChapter.gameCharacterId
                            )}
                            rankingData={
                              historyRanking.find(
                                (elem) => elem.rank === rank
                              ) || {
                                id: -1,
                                eventId,
                                timestamp: "0",
                                rank,
                                score: 0,
                                userId: "0",
                                userName: "N/A",
                              }
                            }
                            eventDuration={eventDuration}
                            eventId={eventId}
                            charaId={currChapter.gameCharacterId}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ))}
              {isTimeTravel &&
                !!sliderTimeRanking.length &&
                (isMobile ? (
                  <Grid container spacing={1}>
                    {(isFullRank ? fullRank : critialRank).map((rank) => (
                      <Grid key={rank} item xs={12}>
                        <LiveMobileRow
                          rankingData={
                            sliderTimeRanking.find(
                              (elem) => elem.rank === rank
                            ) || {
                              id: -1,
                              eventId,
                              timestamp: "0",
                              rank,
                              score: 0,
                              userId: "0",
                              userName: "N/A",
                            }
                          }
                          noPred={true}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell align="center">
                            {t("event:ranking")}
                          </TableCell>
                          <TableCell align="center">
                            {t("event:rankingTable.head.userProfile")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.score")}
                          </TableCell>
                          <TableCell align="right">
                            {t("event:rankingTable.head.speed_per_hour")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(isFullRank ? fullRank : critialRank).map((rank) => (
                          <LiveRow
                            key={rank}
                            rankingReward={chapterRankingRewards?.find(
                              (r) =>
                                r.toRank === rank &&
                                r.gameCharacterId ===
                                  currChapter.gameCharacterId
                            )}
                            rankingData={
                              sliderTimeRanking.find(
                                (elem) => elem.rank === rank
                              ) || {
                                id: -1,
                                eventId,
                                timestamp: "0",
                                rank,
                                score: 0,
                                userId: "0",
                                userName: "N/A",
                              }
                            }
                            eventDuration={eventDuration}
                            noPred
                            charaId={currChapter.gameCharacterId}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ))}
            </ContainerContent>
          )}
        </TabContext>
      </ContainerContent>
    </Fragment>
  );
});

export default EventTackerChapters;
