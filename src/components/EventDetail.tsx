import {
  Box,
  Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
  Container,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { TabContext, TabPanel } from "@material-ui/lab";
import { CronJob } from "cron";
import moment from "moment";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import {
  ContentTransModeType,
  EventRankingRewardRange,
  IEventDeckBonus,
  IEventInfo,
  IGameCharaUnit,
  IHonorInfo,
  IResourceBoxInfo,
} from "../types";
import { useCachedData, useRealtimeEventData } from "../utils";
import { attrIconMap, charaIcons, degreeFrameMap } from "../utils/resources";
import { getAssetI18n } from "../utils/i18n";

const useStyle = makeStyles((theme) => ({
  bannerImg: {
    maxWidth: "100%",
  },
  eventImg: {
    maxWidth: "100%",
    cursor: "pointer",
  },
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

const EventDetail: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const assetI18n = getAssetI18n();

  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );
  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");
  const [honors] = useCachedData<IHonorInfo>("honors");
  const [refreshData, rtRanking] = useRealtimeEventData(Number(eventId));

  const [event, setEvent] = useState<IEventInfo>();
  const [eventDeckBonus, setEventDeckBonus] = useState<IEventDeckBonus[]>([]);
  const [imgTabVal, setImgTabVal] = useState<string>("0");
  // const [intervalId, setIntervalId] = useState<number>();
  const [nextRefreshTime, setNextRefreshTime] = useState<moment.Moment>();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [pastTimePercent, setPastTimePercent] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    if (events.length && eventDeckBonuses.length) {
      setEvent(events.find((elem) => elem.id === Number(eventId)));
      setEventDeckBonus(
        eventDeckBonuses.filter((elem) => elem.eventId === Number(eventId))
      );
    }
  }, [events, eventId, eventDeckBonuses]);

  useEffect(() => {
    const currentTime = Date.now();
    if (
      event &&
      currentTime >= event.startAt &&
      currentTime <= event.rankingAnnounceAt + 5 * 60 * 1000
    ) {
      const cron = new CronJob("5 * * * * *", () => {
        const currentTime = Date.now();
        if (currentTime > event.rankingAnnounceAt + 5 * 60 * 1000) cron.stop();
        else {
          refreshData();
          setNextRefreshTime(cron.nextDate());
        }
      });
      cron.start();
      refreshData();
      setNextRefreshTime(cron.nextDate());

      const interval = window.setInterval(() => {
        setNextRefreshTime((nextDate) => nextDate);
      }, 60);

      return () => {
        cron.stop();
        window.clearInterval(interval);
      };
    } else {
      refreshData();
    }
  }, [refreshData, event]);

  useEffect(() => {
    if (event && Date.now() < event.aggregateAt) {
      setRemainingTime(
        new Date(
          event.aggregateAt -
            Date.now() +
            new Date().getTimezoneOffset() * 60 * 1000
        )
          .toISOString()
          .substring(8, 16)
          .replace("T", " day(s) ")
          .replace(":", "h ")
          .concat(
            `m (${(
              ((Date.now() - event.startAt) /
                (event.aggregateAt - event.startAt)) *
              100
            ).toFixed(1)}%)`
          )
      );

      setPastTimePercent(
        ((Date.now() - event.startAt) / (event.aggregateAt - event.startAt)) *
          100
      );

      const interval = window.setInterval(() => {
        if (Date.now() > event.aggregateAt) {
          window.clearInterval(interval);
          setRemainingTime(t("event:already-ended"));
          return;
        }
        setRemainingTime(
          new Date(
            event.aggregateAt - Date.now() + new Date().getTimezoneOffset()
          )
            .toISOString()
            .substring(8, 16)
            .replace("T", " day(s) ")
            .replace(":", "h ")
            .concat(
              `m (${(
                ((Date.now() - event.startAt) /
                  (event.aggregateAt - event.startAt)) *
                100
              ).toFixed(1)}%)`
            )
        );
        setPastTimePercent(
          ((Date.now() - event.startAt) / (event.aggregateAt - event.startAt)) *
            100
        );
      }, 60000);

      return () => {
        window.clearInterval(interval);
      };
    } else {
      setRemainingTime(t("event:already-ended"));
      setPastTimePercent(100);
    }
  }, [event, t]);

  function getRankingDegreeImg(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return `https://sekai-res.dnaroma.eu/file/sekai-assets/honor/${honor.assetbundleName}_rip/degree_main.webp`;
  }

  function getRankingDegreeName(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return honor.name;
  }

  function getRankingDegreeFrameImg(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return degreeFrameMap[honor.honorRarity];
  }

  function getRankingDegreeFrameName(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return honor.honorRarity;
  }

  function getRankingDegreeRankImg(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return `https://sekai-res.dnaroma.eu/file/sekai-assets/honor/${honor.assetbundleName}_rip/rank_main.webp`;
  }

  function getRankingDegreeRankName(reward: EventRankingRewardRange) {
    const honor = honors.find(
      (honor) =>
        honor.id ===
        resourceBoxes
          .find(
            (resBox) =>
              resBox.resourceBoxPurpose === "event_ranking_reward" &&
              resBox.id === reward.eventRankingRewards[0].resourceBoxId
          )!
          .details.find((detail) => detail.resourceType === "honor")!.resourceId
    )!;

    return honor.levels[0].description;
  }

  const getEventImages: () => ImageDecorator[] = useCallback(
    () =>
      event
        ? [
            {
              src: `https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/bg.webp`,
              alt: "event background",
              downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/bg.webp`,
            },
            {
              src: `https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/character.webp`,
              alt: "event character",
              downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/character.webp`,
            },
          ]
        : [],
    [event]
  );

  return event && eventDeckBonus.length && gameCharacterUnits.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {contentTransMode === "original"
          ? event.name
          : contentTransMode === "translated"
          ? assetI18n.t(`event_name:${eventId}`)
          : event.name}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <TabContext value={imgTabVal}>
          <Paper>
            <Tabs
              value={imgTabVal}
              onChange={(_, v) => setImgTabVal(v)}
              variant="scrollable"
              scrollButtons="desktop"
            >
              <Tab value="0" label={t("event:tab.title[0]")}></Tab>
              <Tab value="1" label={t("event:tab.title[1]")}></Tab>
              <Tab value="2" label={t("event:tab.title[2]")}></Tab>
            </Tabs>
            <TabPanel value="0" classes={{ root: classes.tabpanel }}>
              <Grid container direction="row">
                <Grid item xs={12} md={6}>
                  <img
                    className={classes.bannerImg}
                    src={`https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/logo_rip/logo.webp`}
                    alt="logo"
                  ></img>
                </Grid>
                <Grid item xs={12} md={6}>
                  <img
                    className={classes.bannerImg}
                    src={`https://sekai-res.dnaroma.eu/file/sekai-assets/home/banner/${event.assetbundleName}_rip/${event.assetbundleName}.webp`}
                    alt="logo"
                  ></img>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="1" classes={{ root: classes.tabpanel }}>
              <img
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
                className={classes.eventImg}
                src={`https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/bg.webp`}
                alt="background"
              ></img>
            </TabPanel>
            <TabPanel value="2" classes={{ root: classes.tabpanel }}>
              <img
                onClick={() => {
                  setActiveIdx(1);
                  setVisible(true);
                }}
                className={classes.eventImg}
                src={`https://sekai-res.dnaroma.eu/file/sekai-assets/event/${event.assetbundleName}/screen_rip/character.webp`}
                alt="character"
              ></img>
            </TabPanel>
          </Paper>
        </TabContext>
        <audio
          style={{ width: "100%", margin: "1% 0" }}
          controls
          src={`https://sekai-res.dnaroma.eu/file/sekai-assets/${event.bgmAssetbundleName.replace(
            "bgm",
            "bgm_rip"
          )}.mp3`}
        ></audio>
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:remainingTime")} ({t("event:progress")})
            </Typography>
            <Typography>{remainingTime}</Typography>
          </Grid>
          <LinearProgress variant="determinate" value={pastTimePercent} />
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:id")}
            </Typography>
            <Typography>{event.id}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:title")}
            </Typography>
            <Typography>
              {contentTransMode === "original"
                ? event.name
                : contentTransMode === "translated"
                ? assetI18n.t(`event_name:${eventId}`)
                : event.name}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:type")}
            </Typography>
            <Typography>{t(`event:type.${event.eventType}`)}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostAttribute")}
              </Typography>
            </Grid>
            <Grid
              item
              container
              xs={6}
              spacing={1}
              alignItems="center"
              justify="space-between"
            >
              <Grid
                item
                xs={6}
                sm={10}
                container
                spacing={1}
                justify="flex-end"
              >
                <Grid item>
                  <img
                    style={{ maxHeight: "36px" }}
                    src={attrIconMap[eventDeckBonus[0].cardAttr]}
                    alt={eventDeckBonus[0].cardAttr}
                  ></img>
                </Grid>
              </Grid>
              <Grid item xs={4} sm={2}>
                <Typography>+{eventDeckBonus[6].bonusRate}%</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={4}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostCharacters")}
              </Typography>
            </Grid>
            <Grid
              item
              container
              spacing={1}
              xs={5}
              sm={6}
              alignItems="center"
              justify="space-between"
            >
              <Grid item container spacing={1} xs={6} sm={10}>
                {eventDeckBonus.slice(0, 5).map((elem, idx) => (
                  <Grid key={`chara-${idx}`} item>
                    <img
                      style={{ maxHeight: "36px" }}
                      src={
                        charaIcons[
                          `CharaIcon${
                            gameCharacterUnits.find(
                              (gcu) => gcu.id === elem.gameCharacterUnitId
                            )!.gameCharacterId
                          }`
                        ]
                      }
                      alt={`charater ${
                        gameCharacterUnits.find(
                          (gcu) => gcu.id === elem.gameCharacterUnitId
                        )!.gameCharacterId
                      }`}
                    ></img>
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={5} sm={2}>
                <Typography>+{eventDeckBonus[6].bonusRate}%</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:maxBoost")}
            </Typography>
            <Typography>+50%</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:startAt")}
            </Typography>
            <Typography>{new Date(event.startAt).toLocaleString()}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:endAt")}
            </Typography>
            <Typography>{new Date(event.closedAt).toLocaleString()}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:aggregateAt")}
            </Typography>
            <Typography>
              {new Date(event.aggregateAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:rankingAnnounceAt")}
            </Typography>
            <Typography>
              {new Date(event.rankingAnnounceAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:distributionStartAt")}
            </Typography>
            <Typography>
              {new Date(event.distributionStartAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("event:distributionEndAt")}
            </Typography>
            <Typography>
              {new Date(event.distributionEndAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      {rtRanking.time ? (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("event:ranking")}
          </Typography>
          <Container className={layoutClasses.content} maxWidth="sm">
            <Paper style={{ padding: "2%" }}>
              <Typography variant="h6">
                {t("event:realtime")}{" "}
                {new Date(rtRanking.time).toLocaleString(i18n.language)}
              </Typography>
              {nextRefreshTime ? (
                <Typography variant="body2" color="textSecondary">
                  {t("event:nextfetch")}: {nextRefreshTime.fromNow()}
                </Typography>
              ) : null}
              <Divider style={{ margin: "1% 0" }} />
              <Grid container direction="column">
                {resourceBoxes.length && honors.length
                  ? event.eventRankingRewardRanges.map((elem) =>
                      elem.fromRank >= 100001 ? null : (
                        <Fragment key={elem.toRank}>
                          <Grid
                            item
                            container
                            justify="space-between"
                            alignItems="center"
                          >
                            <Grid item xs={6} md={4}>
                              <Box position="relative">
                                <img
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: elem.fromRank >= 10001 ? "2%" : 0,
                                    maxWidth:
                                      elem.fromRank >= 10001 ? "96%" : "100%",
                                  }}
                                  src={getRankingDegreeFrameImg(elem)}
                                  alt={getRankingDegreeFrameName(elem)}
                                ></img>
                                <img
                                  style={{ maxWidth: "100%" }}
                                  src={getRankingDegreeImg(elem)}
                                  alt={getRankingDegreeName(elem)}
                                ></img>
                                <img
                                  style={{
                                    position: "absolute",
                                    right: "10.5%",
                                    maxHeight: "80%",
                                    top: "6%",
                                  }}
                                  src={getRankingDegreeRankImg(elem)}
                                  alt={getRankingDegreeRankName(elem)}
                                ></img>
                              </Box>
                            </Grid>
                            <Grid item xs={6} container alignItems="center">
                              <Grid item xs={12} md={6}>
                                <Typography align="right">
                                  {
                                    (elem.toRank <= 10
                                      ? rtRanking.first10.find(
                                          (rt) => rt.rank === elem.toRank
                                        )!
                                      : rtRanking[
                                          `rank${elem.toRank}` as "rank20"
                                        ][0] || { name: "" }
                                    ).name
                                  }
                                </Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="h6" align="right">
                                  {
                                    (elem.toRank <= 10
                                      ? rtRanking.first10.find(
                                          (rt) => rt.rank === elem.toRank
                                        )!
                                      : rtRanking[
                                          `rank${elem.toRank}` as "rank20"
                                        ][0] || { score: "N/A" }
                                    ).score
                                  }
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Divider style={{ margin: "1% 0" }} />
                        </Fragment>
                      )
                    )
                  : null}
              </Grid>
            </Paper>
          </Container>
          <Viewer
            visible={visible}
            onClose={() => setVisible(false)}
            images={getEventImages()}
            zIndex={2000}
            activeIndex={activeIdx}
            downloadable
            downloadInNewWindow
            onMaskClick={() => setVisible(false)}
            zoomSpeed={0.25}
            onChange={(_, idx) => setActiveIdx(idx)}
          />
        </Fragment>
      ) : null}
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, event {eventId} does not exist.
    </div>
  );
};

export default EventDetail;
