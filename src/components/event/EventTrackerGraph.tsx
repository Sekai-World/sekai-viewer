import {
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  // Typography,
  useTheme,
} from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useLayoutStyles } from "../../styles/layout";
import { EventGraphRanking, EventRankingResponse } from "../../types";
import { useServerRegion } from "../../utils";
import { useEventTrackerAPI } from "../../utils/eventTracker";

const EventTrackerGraph: React.FC<{
  rtRanking?: EventRankingResponse;
  ranking: EventGraphRanking;
  eventId: number;
  mobileTable?: boolean;
}> = ({ rtRanking, ranking, eventId, mobileTable = false }) => {
  const theme = useTheme();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const [region] = useServerRegion();

  const { getGraph } = useEventTrackerAPI(region);

  const [speedAllTime, setSpeedAllTime] = useState("N/A");
  const [speedLast24h, setSpeedLast24h] = useState("N/A");
  const [speedLast1h, setSpeedLast1h] = useState("N/A");

  const [isShowChart, setIsShowChart] = useState(false);

  const [chartData, setChartData] = useState<
    {
      [key: string]: any;
    }[]
  >([]);

  useEffect(() => {
    if (rtRanking) {
      setChartData((chartData) => [
        ...chartData,
        Object.assign(
          {
            time: new Date(rtRanking.timestamp).getTime(),
          },
          {
            [`T${ranking}`]: rtRanking.score,
            [`T${ranking}_name`]: rtRanking.userName,
          }
        ),
      ]);
    }
  }, [ranking, rtRanking]);

  useEffect(() => {
    if (chartData.length) {
      setSpeedAllTime(() => {
        const last = chartData[chartData.length - 1];
        const first = chartData.find((cd) => cd[`T${ranking}`]);
        if (!first) {
          return t("event:no_enough_data");
        }
        return (
          (last[`T${ranking}`] - first[`T${ranking}`]) /
          ((last.time - first.time) / 1000 / 3600)
        ).toFixed(2);
      });
      setSpeedLast24h(() => {
        const last = chartData[chartData.length - 1];
        let first;
        if (last.time - chartData[0].time <= 24 * 3600 * 1000) {
          // no enough 24h data
          first = chartData.find((cd) => cd[`T${ranking}`]);
        } else {
          first = chartData
            .slice()
            .reverse()
            .find((cd) => cd.time <= last.time - 24 * 3600 * 1000)!;
        }
        if (!first) {
          return t("event:no_enough_data");
        }
        return (
          (last[`T${ranking}`] - first[`T${ranking}`]) /
          ((last.time - first.time) / 1000 / 3600)
        ).toFixed(2);
      });
      setSpeedLast1h(() => {
        const last = chartData[chartData.length - 1];
        let first;
        if (last.time - chartData[0].time <= 1 * 3600 * 1000) {
          // no enough 1h data
          first = chartData.find((cd) => cd[`T${ranking}`]);
        } else {
          first = chartData
            .slice()
            .reverse()
            .find((cd) => cd.time <= last.time - 1 * 3600 * 1000)!;
        }
        if (!first) {
          return t("event:no_enough_data");
        }
        return (
          (last[`T${ranking}`] - first[`T${ranking}`]) /
          ((last.time - first.time) / 1000 / 3600)
        ).toFixed(2);
      });
    }
  }, [chartData, chartData.length, ranking, t]);

  const handleFetchGraph = useCallback(async () => {
    let data: EventRankingResponse[];
    data = await getGraph(eventId, ranking);
    let baseData: typeof chartData = data.map((_data) => ({
      time: new Date(_data.timestamp).getTime(),
    }));
    data.forEach((_data) => {
      const _idx = baseData.findIndex(
        (bd) => bd.time === new Date(_data.timestamp).getTime()
      );
      if (_idx !== -1) {
        baseData[_idx][`T${ranking}`] = _data.score;
        baseData[_idx][`T${ranking}_name`] = _data.userName;
      } else {
        baseData.push({
          time: new Date(_data.timestamp).getTime(),
          [`T${ranking}`]: _data.score,
          [`T${ranking}_name`]: _data.userName,
        });
      }
    });
    setChartData(baseData);
    setIsShowChart(true);
  }, [eventId, getGraph, ranking]);

  useEffect(() => {
    setIsShowChart(false);
    handleFetchGraph();
  }, [handleFetchGraph]);

  return isShowChart ? (
    <Fragment>
      <Grid container className={layoutClasses.content}>
        <Grid item xs={12}>
          <Paper variant={mobileTable ? "elevation" : "outlined"}>
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
                  tickFormatter={(tick) => new Date(tick).toLocaleString()}
                />
                <YAxis type="number" domain={["auto", "auto"]} />
                <Brush
                  dataKey="time"
                  tickFormatter={(tick) => new Date(tick).toLocaleString()}
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
                <Legend />
                <Line
                  // type="natural"
                  dataKey={`T${ranking}`}
                  dot={false}
                  // stroke={colorArray[idx]}
                  // hide={lineProps[`T${ranking}`] === "disabled"}
                  strokeWidth={4}
                  // strokeOpacity={
                  //   !lineProps.hover || lineProps.hover === `T${ranking}`
                  //     ? 1
                  //     : 0.4
                  // }
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      {mobileTable ? (
        <TableContainer
          component={Paper}
          variant={mobileTable ? "elevation" : "outlined"}
          className={layoutClasses.content}
        >
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>{t("event:speedTable.head.all_time")}</TableCell>
                <TableCell align="center">{speedAllTime}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("event:speedTable.head.last_24h")}</TableCell>
                <TableCell align="center">{speedLast24h}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t("event:speedTable.head.last_1h")}</TableCell>
                <TableCell align="center">{speedLast1h}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          className={layoutClasses.content}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("event:ranking")}</TableCell>
                <TableCell align="center">
                  {t("event:speedTable.head.all_time")}
                </TableCell>
                <TableCell align="center">
                  {t("event:speedTable.head.last_24h")}
                </TableCell>
                <TableCell align="center">
                  {t("event:speedTable.head.last_1h")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>T{ranking}</TableCell>
                <TableCell align="center">{speedAllTime}</TableCell>
                <TableCell align="center">{speedLast24h}</TableCell>
                <TableCell align="center">{speedLast1h}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Fragment>
  ) : (
    <CircularProgress size={24} />
  );
};

export default EventTrackerGraph;
