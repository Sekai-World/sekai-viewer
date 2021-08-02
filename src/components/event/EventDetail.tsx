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
  ICheerfulCarnivalSummary,
  ICheerfulCarnivalTeam,
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
// import DegreeImage from "../subs/DegreeImage";
import ResourceBox from "../subs/ResourceBox";
import { OpenInNew } from "@material-ui/icons";
import { useInteractiveStyles } from "../../styles/interactive";
import AudioPlayer from "../music/AudioPlayer";
import AgendaView from "../virtual_live/AgendaView";
// import AdSense from "../subs/AdSense";
import Image from "material-ui-image";
import { useStrapi } from "../../utils/apiClient";
import { CommentTextMultiple } from "mdi-material-ui";
import Comment from "../comment/Comment";

const useStyle = makeStyles((theme) => ({
  // bannerImg: {
  //   maxWidth: "100%",
  // },
  // eventImg: {
  //   maxWidth: "100%",
  //   cursor: "pointer",
  // },
  tabpanel: {
    padding: theme.spacing("0.1rem", 0, 0, 0),
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
  const { getEvent } = useStrapi();

  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );
  const [eventCardsCache] = useCachedData<IEventCard>("eventCards");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [virtualLives] = useCachedData<IVirtualLiveInfo>("virtualLives");
  const [cheerfulCarnivalSummaries] = useCachedData<ICheerfulCarnivalSummary>(
    "cheerfulCarnivalSummaries"
  );
  const [cheerfulCarnivalTeams] = useCachedData<ICheerfulCarnivalTeam>(
    "cheerfulCarnivalTeams"
  );

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
  const [ccTeams, setCcTeams] = useState<ICheerfulCarnivalTeam[]>([]);
  const [ccSummary, setCcSummary] = useState<ICheerfulCarnivalSummary>();
  const [eventCommentId, setEventCommentId] = useState<number>(0);

  useEffect(() => {
    if (event) {
      const name = getTranslated(`event_name:${eventId}`, event.name);
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
                elem.attr === edb[0].cardAttr &&
                elem.releaseAt <= ev!.startAt;
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
    if (event) {
      const job = async () => {
        const eventStrapi = await getEvent(event.id);
        if (eventStrapi) {
          setEventCommentId(eventStrapi.id);
        }
      };

      job();
    }
  }, [event, getEvent]);

  useEffect(() => {
    if (
      event &&
      event.eventType === "cheerful_carnival" &&
      cheerfulCarnivalSummaries &&
      cheerfulCarnivalTeams
    ) {
      setCcTeams(
        cheerfulCarnivalTeams.filter((cct) => cct.eventId === event.id)
      );
      setCcSummary(
        cheerfulCarnivalSummaries.find((ccs) => ccs.eventId === event.id)
      );
    }
  }, [cheerfulCarnivalSummaries, cheerfulCarnivalTeams, event]);

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
  const [ccTeam1Logo, setCcTeam1Logo] = useState<string>("");
  const [ccTeam2Logo, setCcTeam2Logo] = useState<string>("");

  useEffect(() => {
    if (event) {
      getRemoteAssetURL(
        `event/${event.assetbundleName}/logo_rip/logo.webp`,
        setEventLogo,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `home/banner/${event.assetbundleName}_rip/${event.assetbundleName}.webp`,
        setEventBanner,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/bg.webp`,
        setEventBackground,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/character.webp`,
        setEventCharacter,
        window.isChinaMainland
      );
    }
  }, [event]);

  useEffect(() => {
    if (event && ccTeams.length) {
      getRemoteAssetURL(
        `event/${event.assetbundleName}/team_image_rip/${ccTeams[0].assetbundleName}.webp`,
        setCcTeam1Logo,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/team_image_rip/${ccTeams[1].assetbundleName}.webp`,
        setCcTeam2Logo,
        window.isChinaMainland
      );
    }
  }, [ccTeams, cheerfulCarnivalSummaries, cheerfulCarnivalTeams, event]);

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
        {getTranslated(`event_name:${eventId}`, event.name)}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
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
                  <Image
                    // className={classes.bannerImg}
                    src={eventLogo}
                    alt="logo"
                    aspectRatio={16 / 7}
                    color=""
                  ></Image>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Image
                    // className={classes.bannerImg}
                    src={eventBanner}
                    alt="banner"
                    aspectRatio={16 / 7}
                    color=""
                  ></Image>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="1" classes={{ root: classes.tabpanel }}>
              <Image
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
                className={interactiveClasses.pointer}
                src={eventBackground}
                aspectRatio={1.625}
                alt="background"
                color=""
              ></Image>
            </TabPanel>
            <TabPanel value="2" classes={{ root: classes.tabpanel }}>
              <Image
                onClick={() => {
                  setActiveIdx(1);
                  setVisible(true);
                }}
                className={interactiveClasses.pointer}
                src={eventCharacter}
                aspectRatio={1.625}
                alt="character"
                color=""
              ></Image>
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
                <Grid item xs={8}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:eventTracker")}
                  </Typography>
                </Grid>
                <Grid item container justify="flex-end">
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
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:storyReader")}
              </Typography>
            </Grid>
            <Grid item container justify="flex-end">
              <Link
                to={`/storyreader/eventStory/${event.id}`}
                className={interactiveClasses.noDecoration}
              >
                <Grid container alignItems="center">
                  <OpenInNew />
                </Grid>
              </Link>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("event:title.boost")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={5}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostAttribute")}
              </Typography>
            </Grid>
            <Grid item xs={5} sm={6}>
              <Grid
                spacing={1}
                container
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={6} sm={10}>
                  <Grid container spacing={1} justify="flex-end">
                    <Grid item>
                      <img
                        style={{ maxHeight: "36px" }}
                        src={attrIconMap[eventDeckBonus[0].cardAttr]}
                        alt={eventDeckBonus[0].cardAttr}
                      ></img>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={5} sm={2}>
                  <Typography>+{eventDeckBonus[10].bonusRate}%</Typography>
                </Grid>
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
            <Grid item xs={5}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostCharacters")}
              </Typography>
            </Grid>
            <Grid item xs={5} sm={6}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={6} sm={10}>
                  <Grid container spacing={1} justify="flex-end">
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
                </Grid>
                <Grid item xs={5} sm={2}>
                  <Typography>+{eventDeckBonus[6].bonusRate}%</Typography>
                </Grid>
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
            <Grid item xs={5} sm={6}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={6} sm={10}></Grid>
                <Grid item xs={5} sm={2}>
                  <Typography>+{eventDeckBonus[0].bonusRate}%</Typography>
                </Grid>
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
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("event:boostCards")}
              </Typography>
            </Grid>
            <Grid
              item
              xs={8}
              sm={7}
              md={6}
              container
              justify="flex-end"
              spacing={2}
            >
              {boostCards.map((card) => (
                <Grid key={card.id} item xs={5} md={4} lg={3}>
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
      <Container className={layoutClasses.content} maxWidth="md">
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
            <Grid
              item
              xs={8}
              sm={7}
              md={6}
              container
              justify="flex-end"
              spacing={2}
            >
              {eventCards.map((card) => (
                <Grid key={card.cardId} item xs={5} md={4} lg={3}>
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
      {event.eventType === "cheerful_carnival" &&
        !!ccTeams.length &&
        ccSummary && (
          <Fragment>
            <Typography variant="h6" className={layoutClasses.header}>
              {t("event:title.cheerful_carnival")}
            </Typography>
            <Container className={layoutClasses.content} maxWidth="md">
              <ContentTrans
                contentKey={`cheerful_carnival_themes:${ccSummary.id}`}
                original={ccSummary.theme}
                originalProps={{ align: "center", variant: "h6" }}
                translatedProps={{ align: "center", variant: "h6" }}
              />
              <Grid
                className={classes["grid-out"]}
                container
                spacing={1}
                justify="space-around"
              >
                <Grid item xs={5} md={3} lg={2}>
                  <Image src={ccTeam1Logo} color="" />
                  <ContentTrans
                    contentKey={`cheerful_carnival_teams:${ccTeams[0].id}`}
                    original={ccTeams[0].teamName}
                    originalProps={{ align: "center" }}
                    translatedProps={{ align: "center" }}
                  />
                </Grid>
                <Grid item xs={5} md={3} lg={2}>
                  <Image src={ccTeam2Logo} color="" />
                  <ContentTrans
                    contentKey={`cheerful_carnival_teams:${ccTeams[1].id}`}
                    original={ccTeams[1].teamName}
                    originalProps={{ align: "center" }}
                    translatedProps={{ align: "center" }}
                  />
                </Grid>
              </Grid>
              <Grid
                className={classes["grid-out"]}
                container
                direction="column"
              >
                <Grid
                  item
                  container
                  direction="row"
                  wrap="nowrap"
                  justify="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("event:cheerful_carnival_midterm_1")}
                  </Typography>
                  <Typography align="right">
                    {new Date(ccSummary.midtermAnnounce1At).toLocaleString()}
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
                    {t("event:cheerful_carnival_midterm_2")}
                  </Typography>
                  <Typography align="right">
                    {new Date(ccSummary.midtermAnnounce2At).toLocaleString()}
                  </Typography>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Grid>
            </Container>
          </Fragment>
        )}
      <Typography variant="h6" className={layoutClasses.header}>
        {t("event:title.timepoint")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
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
        </Grid>
      </Container>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
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
      <Container
        className={layoutClasses.content}
        maxWidth="md"
        style={{ maxHeight: 400, overflow: "auto" }}
      >
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
                  <Grid item xs={12}>
                    <ResourceBox
                      resourceBoxId={
                        rankingReward.eventRankingRewards[0].resourceBoxId
                      }
                      resourceBoxPurpose="event_ranking_reward"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ))}
        </Grid>
      </Container>
      {!!eventCommentId && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:comment")} <CommentTextMultiple />
          </Typography>
          <Container className={layoutClasses.content} maxWidth="md">
            <Comment contentType="event" contentId={eventCommentId} />
          </Container>
        </Fragment>
      )}
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
