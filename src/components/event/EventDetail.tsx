import {
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
import { useLayoutStyles } from "../../styles/layout";
import { TabContext, TabPanel } from "@material-ui/lab";
import { CronJob } from "cron";
import moment from "moment";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { IEventDeckBonus, IEventInfo, IGameCharaUnit } from "../../types";
import {
  getRemoteAssetURL,
  useCachedData,
  useRealtimeEventData,
} from "../../utils";
import { attrIconMap, charaIcons } from "../../utils/resources";
import { useAssetI18n } from "../../utils/i18n";
import { useDurationI18n } from "../../utils/i18nDuration";
import { SettingContext } from "../../context";
import { ContentTrans } from "../subs/ContentTrans";
import DegreeImage from "../subs/DegreeImage";

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

const EventDetail: React.FC<{}> = () => {
  const { t, i18n } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const [humanizeDuration] = useDurationI18n();

  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );
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
    if (event) {
      const name = getTranslated(
        contentTransMode,
        `event_name:${eventId}`,
        event.name
      );
      document.title = t("title:eventDetail", {
        name,
      });
    }
  }, [event, eventId, contentTransMode, getTranslated, t]);

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
    } else if (event && currentTime >= event.rankingAnnounceAt) {
      refreshData();
    }
  }, [refreshData, event]);

  useEffect(() => {
    if (!event) {
      return;
    }

    let interval: number | undefined;

    const update = () => {
      if (Date.now() > event.aggregateAt) {
        // event already ended
        if (interval != null) {
          window.clearInterval(interval);
          interval = undefined;
        }
        setRemainingTime(t("event:alreadyEnded"));
        setPastTimePercent(100);
        return false;
      } else if (Date.now() < event.startAt) {
        if (interval != null) {
          window.clearInterval(interval);
          interval = undefined;
        }
        setRemainingTime(t("event:notStarted"));
        setPastTimePercent(0);
        return false;
      }

      const progressPercent =
        ((Date.now() - event.startAt) / (event.aggregateAt - event.startAt)) *
        100;

      setRemainingTime(
        `${humanizeDuration(event.aggregateAt - Date.now(), {
          units: ["d", "h", "m"],
          round: true,
        })} (${progressPercent.toFixed(1)}%)`
      );

      setPastTimePercent(progressPercent);
      return true;
    };

    if (!update()) {
      // event already ended
      return;
    }

    interval = window.setInterval(update, 60000);

    return () => {
      if (interval != null) {
        window.clearInterval(interval);
        interval = undefined;
      }
    };
  }, [event, t, humanizeDuration]);

  const [eventLogo, setEventLogo] = useState<string>("");
  const [eventBanner, setEventBanner] = useState<string>("");
  const [eventBackground, setEventBackground] = useState<string>("");
  const [eventCharacter, setEventCharacter] = useState<string>("");

  useEffect(() => {
    if (event) {
      getRemoteAssetURL(
        `event/${event.assetbundleName}/logo_rip/logo.webp`,
        setEventLogo
      );
      getRemoteAssetURL(
        `home/banner/${event.assetbundleName}_rip/${event.assetbundleName}.webp`,
        setEventBanner
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/bg.webp`,
        setEventBackground
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/character.webp`,
        setEventCharacter
      );
    }
  }, [event]);

  const getEventImages: () => ImageDecorator[] = useCallback(
    () =>
      eventBackground && eventCharacter
        ? [
            {
              src: eventBackground,
              alt: "event background",
              downloadUrl: eventBackground,
            },
            {
              src: eventCharacter,
              alt: "event character",
              downloadUrl: eventCharacter,
            },
          ]
        : [],
    [eventBackground, eventCharacter]
  );

  return event && eventDeckBonus.length && gameCharacterUnits.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getTranslated(contentTransMode, `event_name:${eventId}`, event.name)}
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
                    src={eventLogo}
                    alt="logo"
                  ></img>
                </Grid>
                <Grid item xs={12} md={6}>
                  <img
                    className={classes.bannerImg}
                    src={eventBanner}
                    alt="banner"
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
                src={eventBackground}
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
                src={eventCharacter}
                alt="character"
              ></img>
            </TabPanel>
          </Paper>
        </TabContext>
        <audio
          style={{ width: "100%", margin: "1% 0" }}
          controls
          src={`${
            process.env.REACT_APP_ASSET_DOMAIN
          }/file/sekai-assets/${event.bgmAssetbundleName.replace(
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
            <Grid item>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:title")}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction="column" spacing={1}>
                <ContentTrans
                  mode={contentTransMode}
                  contentKey={`event_name:${eventId}`}
                  original={event.name}
                  originalProps={{ align: "right" }}
                  translatedProps={{ align: "right" }}
                />
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
                      alt={`character ${
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
              {t("event:startAt")}
            </Typography>
            <Typography align="right">
              {new Date(event.startAt).toLocaleString()}
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
              {t("event:closeAt")}
            </Typography>
            <Typography align="right">
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
              {t("event:endAt")}
            </Typography>
            <Typography align="right">
              {new Date(event.closedAt).toLocaleString()}
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
            <Typography align="right">
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
            <Typography align="right">
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
            <Typography align="right">
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
                {event.eventRankingRewardRanges.map((elem) =>
                  elem.fromRank >= 100001 ? null : (
                    <Fragment key={elem.toRank}>
                      <Grid
                        item
                        container
                        justify="space-between"
                        alignItems="center"
                      >
                        <Grid item xs={6} md={4}>
                          <DegreeImage
                            resourceBoxId={
                              elem.eventRankingRewards[0].resourceBoxId
                            }
                            type="event_ranking_reward"
                          />
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
                )}
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
