import {
  Button,
  Container,
  // Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  // useMediaQuery,
  useTheme,
  // useTheme,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { CronJob } from "cron";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  // useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
// import ApexChart from "react-apexcharts";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  Legend,
  ResponsiveContainer,
} from "recharts";
// import { isMobile } from "react-device-detect";
import { SettingContext } from "../../context";
import { SekaiCurrentEventModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import {
  EventGraphRanking,
  EventRankingResponse,
  IEventInfo,
  UserRanking,
} from "../../types";
import { getColorArray, useCachedData } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
import {
  useEventTrackerAPI,
  useRealtimeEventData,
} from "../../utils/eventTracker";
import { useAssetI18n } from "../../utils/i18n";
// import DegreeImage from "../subs/DegreeImage";
import { HistoryRow, LiveRow } from "./EventTrackerTableRow";

const useStyles = makeStyles((theme) => ({
  eventSelect: {
    width: "100%",
    maxWidth: 300,
  },
}));

const EventTracker: React.FC<{}> = () => {
  const theme = useTheme();
  const layoutClasses = useLayoutStyles();
  const classes = useStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { getSekaiCurrentEvent } = useStrapi();
  const { getGraph, getLive } = useEventTrackerAPI();
  const { contentTransMode } = useContext(SettingContext)!;
  // const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  // const preferDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [refreshData] = useRealtimeEventData();

  const [events] = useCachedData<IEventInfo>("events");
  const [currEvent, setCurrEvent] = useState<SekaiCurrentEventModel>();
  const [selectedEvent, setSelectedEvent] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [selectedRankings, setSelectedRankings] = useState<EventGraphRanking[]>(
    [1000, 10000, 100000]
  );
  const [graphEvent, setGraphEvent] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [graphRankings, setGraphRankings] = useState<EventGraphRanking[]>([]);
  // const [isRealtimeChecked, setIsRealtimeChecked] = useState(false);
  // const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isShowChart, setIsShowChart] = useState(false);
  const [colorArray, setColorArray] = useState<string[]>([]);
  const [lineProps, setLineProps] = useState<
    {
      hover: string;
    } & { [key: string]: string }
  >({ hover: "" });

  const [chartData, setChartData] = useState<
    {
      [key: string]: any;
    }[]
  >([]);
  const [rtRanking, setRtRanking] = useState<EventRankingResponse[]>([]);
  const [rtTime, setRtTime] = useState<Date>();
  const [historyRanking, setHistoryRanking] = useState<UserRanking[]>([]);
  const [historyTime, setHistoryTime] = useState<Date>();
  const [nextRefreshTime, setNextRefreshTime] = useState<moment.Moment>();
  const [refreshCron, setRefreshCron] = useState<CronJob>();

  useEffect(() => {
    document.title = t("title:eventTracker");
  }, [t]);

  const getCurrentEvent = useCallback(() => {
    getSekaiCurrentEvent().then((data) => {
      setCurrEvent(data);
      setSelectedEvent({
        name: getTranslated(
          contentTransMode,
          `event_name:${data.eventId}`,
          data.eventJson.name
        ),
        id: data.eventId,
      });
    });
  }, [contentTransMode, getSekaiCurrentEvent, getTranslated]);

  useEffect(() => {
    getCurrentEvent();
  }, [getCurrentEvent]);

  useEffect(() => {
    return () => {
      if (refreshCron) refreshCron.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRealtimeData = useCallback(async () => {
    const data = await getLive();
    setRtRanking(data);
    setRtTime(new Date(data[0].timestamp));
  }, [getLive]);

  const getHistoryData = useCallback(
    async (eventId: number) => {
      const data = await refreshData(eventId);
      setHistoryTime(new Date(data.time));
      const rankingData = Object.values(data).filter((elem) =>
        Array.isArray(elem)
      ) as UserRanking[][];
      console.log(Object.values(data), rankingData);
      setHistoryRanking(
        rankingData.reduce(
          (sum, elem) => [...sum, ...elem],
          []
        ) as UserRanking[]
      );
    },
    [refreshData]
  );

  const handleFetchGraph = useCallback(async () => {
    setGraphRankings([]);
    setGraphEvent(null);
    setRtRanking([]);
    setRtTime(undefined);
    setHistoryRanking([]);
    setHistoryTime(undefined);

    setFetchProgress(0);
    setIsFetching(true);
    setIsShowChart(false);
    setLineProps({ hover: "" });
    if (!selectedRankings.length || !selectedEvent) {
      setIsFetching(false);
      setFetchProgress(0);
      setIsShowChart(false);
      return;
    }

    // real time data
    const event = events.find((elem) => elem.id === selectedEvent.id)!;
    if (currEvent?.eventId === selectedEvent?.id) {
      // get realtime data from live endpoint
      const currentTime = Date.now();
      if (
        event &&
        currentTime >= event.startAt &&
        currentTime <= event.rankingAnnounceAt + 5 * 60 * 1000
      ) {
        if (refreshCron) refreshCron.stop();
        const cron = new CronJob("10 * * * * *", () => {
          const currentTime = Date.now();
          if (currentTime > event.rankingAnnounceAt + 5 * 60 * 1000)
            cron.stop();
          else {
            refreshRealtimeData();
            setNextRefreshTime(cron.nextDate());
          }
        });
        cron.start();
        setRefreshCron(cron);
        refreshRealtimeData();
        setNextRefreshTime(cron.nextDate());
      } else if (event && currentTime >= event.rankingAnnounceAt) {
        getHistoryData(event.id);
      }
    } else {
      getHistoryData(event.id);
    }
    setGraphEvent({ ...selectedEvent });

    const total = selectedRankings.length;
    let fetched = 0;
    const datas: EventRankingResponse[][] = [];
    for (let ranking of selectedRankings) {
      datas.push(await getGraph(selectedEvent.id, ranking));
      fetched += 1;
      setFetchProgress(Math.floor((fetched / total) * 100));
    }
    const baseData: typeof chartData = datas[0].map((data) => ({
      time: new Date(data.timestamp).getTime(),
    }));
    selectedRankings.forEach((ranking, idx) => {
      datas[idx].forEach((data, _idx) => {
        baseData[_idx][`T${ranking}`] = data.score;
        baseData[_idx][`T${ranking}_name`] = data.userName;
      });
    });
    setChartData(baseData);
    setColorArray(getColorArray(selectedRankings.length));
    setLineProps(
      selectedRankings.reduce(
        (sum, ranking) =>
          Object.assign({}, sum, {
            [`T${ranking}`]: "enabled",
          }),
        { hover: "" }
      )
    );
    setGraphRankings([...selectedRankings]);
    setIsFetching(false);
    setIsShowChart(true);
  }, [
    chartData,
    currEvent,
    events,
    getGraph,
    getHistoryData,
    refreshCron,
    refreshRealtimeData,
    selectedEvent,
    selectedRankings,
  ]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:eventTracker")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid container spacing={1} alignItems="center">
          <Grid item className={classes.eventSelect}>
            <Autocomplete
              options={events.map((ev) => ({
                name: getTranslated(
                  contentTransMode,
                  `event_name:${ev.id}`,
                  ev.name
                ),
                id: ev.id,
              }))}
              getOptionLabel={(option) => option.name}
              getOptionSelected={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("event:tracker.select.event_name")}
                />
              )}
              value={selectedEvent}
              autoComplete
              onChange={(_, value) => {
                setSelectedEvent(value);
              }}
              disabled={isFetching}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => getCurrentEvent()}
              disabled={isFetching}
            >
              {t("event:tracker.button.curr_event")}
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Autocomplete<EventGraphRanking, boolean>
              multiple
              disableCloseOnSelect
              options={[
                1,
                2,
                3,
                // 4,
                // 5,
                // 6,
                // 7,
                // 8,
                // 9,
                10,
                // 20,
                // 30,
                // 40,
                // 50,
                100,
                // 200,
                // 300,
                // 400,
                500,
                1000,
                // 2000,
                // 3000,
                // 4000,
                5000,
                10000,
                // 20000,
                // 30000,
                // 40000,
                50000,
                100000,
              ]}
              getOptionLabel={(opt) => `T${opt}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={t("event:tracker.select.rankings")}
                />
              )}
              value={selectedRankings}
              onChange={(_, values) => {
                if (typeof values === "number") {
                  setSelectedRankings([values]);
                } else if (Array.isArray(values)) {
                  setSelectedRankings(values);
                } else {
                  setSelectedRankings([]);
                }
              }}
              autoComplete
              disabled={isFetching}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFetchGraph}
              disabled={isFetching}
            >
              {t("event:tracker.button.graph")}
            </Button>
          </Grid>
          {isFetching && (
            <Grid item xs={12}>
              <LinearProgress
                variant="buffer"
                value={fetchProgress}
                valueBuffer={fetchProgress}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      {!!graphEvent && isShowChart && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("event:tracker.title.data_graph")}
          </Typography>
          <Container className={layoutClasses.content}>
            <Grid container>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() =>
                    setColorArray(getColorArray(selectedRankings.length))
                  }
                >
                  {t("event:tracker.button.random-palette")}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Paper>
                  {/* <ApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                /> */}
                  <ResponsiveContainer height={500}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        stroke={theme.palette.divider}
                        strokeDasharray="10 10"
                      />
                      <XAxis
                        dataKey="time"
                        scale="time"
                        type="number"
                        domain={["auto", "auto"]}
                        tickFormatter={(tick) =>
                          new Date(tick).toLocaleString()
                        }
                      />
                      <YAxis type="number" domain={["auto", "auto"]} />
                      <Brush
                        dataKey="time"
                        tickFormatter={(tick) =>
                          new Date(tick).toLocaleString()
                        }
                      />
                      <Tooltip
                        labelFormatter={(label) =>
                          new Date(Number(label)).toLocaleString()
                        }
                        contentStyle={{
                          backgroundColor: theme.palette.background.default,
                        }}
                        formatter={(value, name, props) => {
                          return [
                            `${value} - ${props.payload[`${name}_name`]}`,
                            name,
                          ];
                        }}
                      />
                      <Legend
                        onClick={(e) => {
                          setLineProps((props) =>
                            Object.assign({}, props, {
                              [e.dataKey]:
                                props[e.dataKey] === "enabled"
                                  ? "disabled"
                                  : "enabled",
                            })
                          );
                        }}
                        onMouseEnter={(e) =>
                          lineProps[e.dataKey] !== "disabled" &&
                          setLineProps({ ...lineProps, hover: e.dataKey })
                        }
                        onMouseLeave={(e) =>
                          setLineProps({ ...lineProps, hover: "" })
                        }
                      />
                      {graphRankings.map((ranking, idx) => (
                        <Line
                          type="natural"
                          dataKey={`T${ranking}`}
                          dot={false}
                          stroke={colorArray[idx]}
                          hide={lineProps[`T${ranking}`] === "disabled"}
                          strokeWidth={4}
                          strokeOpacity={
                            !lineProps.hover ||
                            lineProps.hover === `T${ranking}`
                              ? 1
                              : 0.4
                          }
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Fragment>
      )}
      {!!graphEvent && !!rtRanking.length && !!rtTime && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("event:ranking")}
          </Typography>
          <Container className={layoutClasses.content}>
            <Typography variant="h6">
              {t("event:realtime")} {rtTime.toLocaleString()}
            </Typography>
            {!!nextRefreshTime && (
              <Typography variant="body2" color="textSecondary">
                {t("event:nextfetch")}: {nextRefreshTime.fromNow()}
              </Typography>
            )}
            {/* <Divider style={{ margin: "1% 0" }} /> */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      {t("event:rankingTable.head.ranking")}
                    </TableCell>
                    <TableCell align="center">
                      {t("event:rankingTable.head.userProfile")}
                    </TableCell>
                    <TableCell align="right">
                      {t("event:rankingTable.head.score")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .find((ev) => ev.id === graphEvent.id)!
                    .eventRankingRewardRanges.map(
                      (rankingReward) =>
                        rankingReward.fromRank <= 100000 &&
                        rtRanking.find(
                          (elem) => elem.rank === rankingReward.toRank
                        ) && (
                          <LiveRow
                            rankingReward={rankingReward}
                            rankingData={
                              rtRanking.find(
                                (elem) => elem.rank === rankingReward.toRank
                              )!
                            }
                          />
                        )
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Fragment>
      )}
      {!!graphEvent && !!historyRanking.length && !!historyTime && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("event:ranking")}
          </Typography>
          <Container className={layoutClasses.content}>
            <Typography variant="h6">
              {t("event:realtime")} {historyTime.toLocaleString()}
            </Typography>
            {/* <Divider style={{ margin: "1% 0" }} /> */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>
                      {t("event:rankingTable.head.ranking")}
                    </TableCell>
                    <TableCell align="center">
                      {t("event:rankingTable.head.userProfile")}
                    </TableCell>
                    <TableCell align="right">
                      {t("event:rankingTable.head.score")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .find((ev) => ev.id === graphEvent.id)!
                    .eventRankingRewardRanges.map(
                      (rankingReward) =>
                        rankingReward.fromRank <= 100000 && (
                          <HistoryRow
                            rankingReward={rankingReward}
                            rankingData={
                              historyRanking.find(
                                (elem) => elem.rank === rankingReward.toRank
                              )!
                            }
                          />
                        )
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Fragment>
      )}
    </Fragment>
  );
};

export default EventTracker;
