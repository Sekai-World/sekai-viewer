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
// import { CronJob } from "cron";
// import moment from "moment";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import {
  ICardInfo,
  IEventCard,
  IEventDeckBonus,
  IEventInfo,
  IGameCharaUnit,
  IVirtualLiveInfo,
} from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { attrIconMap, charaIcons } from "../../utils/resources";
import { useAssetI18n } from "../../utils/i18n";
import { useDurationI18n } from "../../utils/i18nDuration";
import { SettingContext } from "../../context";
import { ContentTrans } from "../subs/ContentTrans";
import { CardThumb } from "../subs/CardThumb";
import DegreeImage from "../subs/DegreeImage";
import ResourceBox from "../subs/ResourceBox";
import { OpenInNew } from "@material-ui/icons";
import { useInteractiveStyles } from "../../styles/interactive";
import AudioPlayer from "../music/AudioPlayer";
import AgendaView from "../virtual_live/AgendaView";
// import AdSense from "../subs/AdSense";

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
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const [humanizeDuration] = useDurationI18n();

  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );
  const [eventCardsCache] = useCachedData<IEventCard>("eventCards");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [virtualLives] = useCachedData<IVirtualLiveInfo>("virtualLives");

  const [event, setEvent] = useState<IEventInfo>();
  const [eventCards, setEventCards] = useState<IEventCard[]>([]);
  const [boostCards, setBoostCards] = useState<ICardInfo[]>([]);
  const [eventDeckBonus, setEventDeckBonus] = useState<IEventDeckBonus[]>([]);
  const [eventBonusCharas, setEventBonusCharas] = useState<IGameCharaUnit[]>(
    []
  );
  const [imgTabVal, setImgTabVal] = useState<string>("0");
  // const [intervalId, setIntervalId] = useState<number>();
  // const [nextRefreshTime, setNextRefreshTime] = useState<moment.Moment>();
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [pastTimePercent, setPastTimePercent] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [eventBgm, setEventBgm] = useState<string>("");
  const [
    linkedVirtualLive,
    setLinkedVirtualLive,
  ] = useState<IVirtualLiveInfo>();

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
      getRemoteAssetURL(
        `${event.bgmAssetbundleName.replace("bgm", "bgm_rip")}.mp3`,
        setEventBgm
      );
    }
  }, [event, eventId, contentTransMode, getTranslated, t]);

  useEffect(() => {
    if (
      events &&
      eventDeckBonuses &&
      eventCardsCache &&
      cards &&
      gameCharacterUnits &&
      virtualLives
    ) {
      const ev = events.find((elem) => elem.id === Number(eventId));
      setEvent(ev);
      const edb = eventDeckBonuses.filter(
        (elem) => elem.eventId === Number(eventId)
      );
      setEventDeckBonus(edb);
      setEventCards(
        eventCardsCache.filter((elem) => elem.eventId === Number(eventId))
      );
      const ebc = edb
        .slice(0, 5)
        .map(
          (elem) =>
            gameCharacterUnits.find(
              (gcu) => gcu.id === elem.gameCharacterUnitId
            )!
        );
      setEventBonusCharas(ebc);
      setBoostCards(
        cards
          .filter((elem) =>
            ebc.some((chara) => {
              let ret =
                chara.gameCharacterId === elem.characterId &&
                elem.attr === edb[0].cardAttr;
              if (elem.characterId >= 21) {
                ret = ret && chara.unit === elem.supportUnit;
              }

              return ret;
            })
          )
          .sort((a, b) => b.rarity - a.rarity)
      );
      setLinkedVirtualLive(
        virtualLives.find((elem) => elem.id === ev?.virtualLiveId)
      );
    }
  }, [
    events,
    eventId,
    eventDeckBonuses,
    eventCardsCache,
    cards,
    gameCharacterUnits,
    virtualLives,
  ]);

  useEffect(() => {
    if (!event) {
      return;
    }

    let interval: number | undefined;

    const update = () => {
      if (Date.now() > event.aggregateAt) {
        // event already ended
        if (interval) {
          window.clearInterval(interval);
          interval = undefined;
        }
        setRemainingTime(t("event:alreadyEnded"));
        setPastTimePercent(100);
        return false;
      } else if (Date.now() < event.startAt) {
        if (interval) {
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
      if (interval) {
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
              downloadUrl: eventBackground.replace(".webp", ".png"),
            },
            {
              src: eventCharacter,
              alt: "event character",
              downloadUrl: eventCharacter.replace(".webp", ".png"),
            },
          ]
        : [],
    [eventBackground, eventCharacter]
  );

  return event &&
    eventDeckBonus.length &&
    gameCharacterUnits &&
    gameCharacterUnits.length &&
    eventCards.length ? (
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
        <AudioPlayer
          style={{ width: "100%", margin: "1% 0" }}
          src={eventBgm}
        ></AudioPlayer>
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
          {Date.now() >= event.startAt && (
            <Fragment>
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
                    {t("common:eventTracker")}
                  </Typography>
                </Grid>
                <Grid item xs={6} container justify="flex-end">
                  <Link
                    to={`/eventtracker?id=${eventId}`}
                    className={interactiveClasses.noDecoration}
                  >
                    <Grid container alignItems="center">
                      <OpenInNew />
                    </Grid>
                  </Link>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("event:title.boost")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid className={classes["grid-out"]} container direction="column">
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
                {eventBonusCharas.slice(0, 5).map((chara, idx) => (
                  <Grid key={`chara-${idx}`} item>
                    <img
                      style={{ maxHeight: "36px" }}
                      src={charaIcons[`CharaIcon${chara.gameCharacterId}`]}
                      alt={`character ${chara.gameCharacterId}`}
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
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostCards")}
              </Typography>
            </Grid>
            <Grid item xs={7} container justify="flex-end" spacing={2}>
              {boostCards.map((card) => (
                <Grid key={card.id} item xs={6} md={4} xl={3}>
                  <Link to={`/card/${card.id}`}>
                    <CardThumb cardId={card.id} />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:card")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:eventCards")}
              </Typography>
            </Grid>
            <Grid item xs={7} container justify="flex-end" spacing={2}>
              {eventCards.map((card) => (
                <Grid key={card.cardId} item xs={6} md={4} xl={3}>
                  <Link to={`/card/${card.cardId}`}>
                    <CardThumb cardId={card.cardId} />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("event:title.timepoint")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
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
      {!!linkedVirtualLive && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:virtualLive")}
          </Typography>
          <Container className={layoutClasses.content} maxWidth="md">
            <AgendaView data={linkedVirtualLive} />
          </Container>
        </Fragment>
      )}
      <Typography variant="h6" className={layoutClasses.header}>
        {t("event:title.rankingRewards")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid className={classes["grid-out"]} container direction="column">
          {event.eventRankingRewardRanges.map((rankingReward) => (
            <Fragment key={rankingReward.id}>
              <Grid
                item
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={4}>
                  <Typography>
                    {t("event:rankingReward.start")}: {rankingReward.fromRank}
                  </Typography>
                  <Typography>
                    {t("event:rankingReward.end")}: {rankingReward.toRank}
                  </Typography>
                </Grid>
                <Grid item xs={8} container spacing={1} alignItems="center">
                  {rankingReward.toRank <= 100000 ? (
                    <Fragment>
                      <Grid item xs={6}>
                        <DegreeImage
                          style={{ minHeight: "30px", maxHeight: "40px" }}
                          resourceBoxId={
                            rankingReward.eventRankingRewards[0].resourceBoxId
                          }
                          type="event_ranking_reward"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ResourceBox
                          resourceBoxId={
                            rankingReward.eventRankingRewards[0].resourceBoxId
                          }
                          resourceBoxPurpose="event_ranking_reward"
                        />
                      </Grid>
                    </Fragment>
                  ) : (
                    <Grid item xs={12}>
                      <ResourceBox
                        resourceBoxId={
                          rankingReward.eventRankingRewards[0].resourceBoxId
                        }
                        resourceBoxPurpose="event_ranking_reward"
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ))}
        </Grid>
      </Container>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="5596436251"
        format="auto"
        responsive="true"
      /> */}
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
  ) : (
    <div>
      Loading... If you saw this for a while, event {eventId} does not exist.
    </div>
  );
};

export default EventDetail;
