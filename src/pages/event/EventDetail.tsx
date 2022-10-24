import {
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Typography,
  Box,
} from "@mui/material";
import { TabContext } from "@mui/lab";
import React, { Fragment, useCallback, useEffect, useState } from "react";
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
  IEventMusic,
  IGameCharaUnit,
  IVirtualLiveInfo,
} from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { attrIconMap, charaIcons } from "../../utils/resources";
import { useAssetI18n } from "../../utils/i18n";
import { useDurationI18n } from "../../utils/i18nDuration";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { CardThumb } from "../../components/widgets/CardThumb";
// import DegreeImage from "../../components/widgets/DegreeImage";
import ResourceBox from "../../components/widgets/ResourceBox";
import { OpenInNew } from "@mui/icons-material";
import AudioPlayer from "../music/AudioPlayer";
import AgendaView from "../virtual_live/AgendaView";
// import AdSense from "../../components/blocks/AdSense";
import Image from "mui-image";
import { useStrapi } from "../../utils/apiClient";
import CommentTextMultiple from "~icons/mdi/comment-text-multiple";
import Comment from "../comment/Comment";
import CheerfulCarnivalTeamIcon from "../../components/widgets/CheerfulCarnivalTeamIcon";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import TabPanelPadding from "../../components/styled/TabPanelPadding";
import GridOut from "../../components/styled/GridOut";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";

const EventDetail: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const { getTranslated } = useAssetI18n();
  const {
    settings: { contentTransMode },
    region,
  } = useRootStore();
  const [humanizeDuration] = useDurationI18n();
  const { getEvent } = useStrapi();

  const [events] = useCachedData<IEventInfo>("events");
  const [eventDeckBonuses] = useCachedData<IEventDeckBonus>("eventDeckBonuses");
  const [gameCharacterUnits] =
    useCachedData<IGameCharaUnit>("gameCharacterUnits");
  const [eventCardsCache] = useCachedData<IEventCard>("eventCards");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [virtualLives] = useCachedData<IVirtualLiveInfo>("virtualLives");
  const [cheerfulCarnivalSummaries] = useCachedData<ICheerfulCarnivalSummary>(
    "cheerfulCarnivalSummaries"
  );
  const [cheerfulCarnivalTeams] = useCachedData<ICheerfulCarnivalTeam>(
    "cheerfulCarnivalTeams"
  );
  const [eventMusics] = useCachedData<IEventMusic>("eventMusics");

  const [event, setEvent] = useState<IEventInfo>();
  const [eventCards, setEventCards] = useState<IEventCard[]>([]);
  const [boostCards, setBoostCards] = useState<ICardInfo[]>([]);
  const [eventDeckBonus, setEventDeckBonus] = useState<IEventDeckBonus[]>([]);
  const [eventAttrBonus, setEventAttrBonus] = useState<IEventDeckBonus>();
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
  const [linkedVirtualLive, setLinkedVirtualLive] =
    useState<IVirtualLiveInfo>();
  const [ccTeams, setCcTeams] = useState<ICheerfulCarnivalTeam[]>([]);
  const [ccSummary, setCcSummary] = useState<ICheerfulCarnivalSummary>();
  const [eventCommentId, setEventCommentId] = useState<number>(0);
  const [eventMusic, setEventMusic] = useState<IEventMusic>();

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
      setEventAttrBonus(edb.find((it) => it.gameCharacterUnitId === undefined));
      setEventCards(
        eventCardsCache.filter((elem) => elem.eventId === Number(eventId))
      );
      const ebc = edb
        .filter(
          (it) =>
            it.cardAttr !== undefined && it.gameCharacterUnitId !== undefined
        )
        .map(
          (elem) =>
            gameCharacterUnits.find(
              (gcu) => gcu.id === elem.gameCharacterUnitId
            )!
        );
      setEventBonusCharas(ebc);
      setBoostCards(() => {
        let result = cards.filter((elem) =>
          ebc.some((chara) => {
            let ret =
              chara.gameCharacterId === elem.characterId &&
              elem.attr === edb[0].cardAttr &&
              elem.releaseAt <= ev!.aggregateAt;
            if (elem.characterId >= 21) {
              ret = ret && chara.unit === elem.supportUnit;
            }

            return ret;
          })
        );
        if (result.length) {
          const sortKey =
            result[0] && result[0].rarity ? "rarity" : "cardRarityType";
          result = result.sort((a, b) => {
            if (a[sortKey]! > b[sortKey]!) return 1;
            if (a[sortKey]! < b[sortKey]!) return -1;

            return 0;
          });
        }

        return result;
      });
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
    if (event && eventMusics) {
      setEventMusic(eventMusics.find((em) => em.eventId === event.id));
    }
  }, [event, eventMusics]);

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
  // const [ccTeam1Logo, setCcTeam1Logo] = useState<string>("");
  // const [ccTeam2Logo, setCcTeam2Logo] = useState<string>("");

  useEffect(() => {
    if (event) {
      getRemoteAssetURL(
        `event/${event.assetbundleName}/logo_rip/logo.webp`,
        setEventLogo,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
      getRemoteAssetURL(
        `home/banner/${event.assetbundleName}_rip/${event.assetbundleName}.webp`,
        setEventBanner,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/bg.webp`,
        setEventBackground,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
      getRemoteAssetURL(
        `event/${event.assetbundleName}/screen_rip/character.webp`,
        setEventCharacter,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
    }
  }, [event, region]);

  // useEffect(() => {
  //   if (event && ccTeams.length) {
  //     getRemoteAssetURL(
  //       `event/${event.assetbundleName}/team_image_rip/${ccTeams[0].assetbundleName}.webp`,
  //       setCcTeam1Logo,
  //       window.isChinaMainland
  //     );
  //     getRemoteAssetURL(
  //       `event/${event.assetbundleName}/team_image_rip/${ccTeams[1].assetbundleName}.webp`,
  //       setCcTeam2Logo,
  //       window.isChinaMainland
  //     );
  //   }
  // }, [ccTeams, cheerfulCarnivalSummaries, cheerfulCarnivalTeams, event]);

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
      <TypographyHeader>
        {getTranslated(`event_name:${eventId}`, event.name)}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <TabContext value={imgTabVal}>
          <Paper>
            <Tabs
              value={imgTabVal}
              onChange={(_, v) => setImgTabVal(v)}
              variant="scrollable"
              scrollButtons
            >
              <Tab value="0" label={t("event:tab.title[0]")}></Tab>
              <Tab value="1" label={t("event:tab.title[1]")}></Tab>
              <Tab value="2" label={t("event:tab.title[2]")}></Tab>
            </Tabs>
            <TabPanelPadding value="0">
              <Grid container direction="row">
                <Grid item xs={12} md={6}>
                  <Image
                    // className={classes.bannerImg}
                    src={eventLogo}
                    alt="logo"
                    // aspectRatio={16 / 7}
                    bgColor=""
                    fit="contain"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Image
                    // className={classes.bannerImg}
                    src={eventBanner}
                    alt="banner"
                    // aspectRatio={16 / 7}
                    bgColor=""
                    fit="contain"
                  ></Image>
                </Grid>
              </Grid>
            </TabPanelPadding>
            <TabPanelPadding value="1">
              <div
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
              >
                <Box
                  component={Image}
                  sx={{ cursor: "pointer" }}
                  src={eventBackground}
                  // aspectRatio={1.625}
                  alt="background"
                  bgColor=""
                />
              </div>
            </TabPanelPadding>
            <TabPanelPadding value="2">
              <div
                onClick={() => {
                  setActiveIdx(1);
                  setVisible(true);
                }}
              >
                <Box
                  component={Image}
                  sx={{ cursor: "pointer" }}
                  src={eventCharacter}
                  // aspectRatio={1.625}
                  alt="character"
                  bgColor=""
                />
              </div>
            </TabPanelPadding>
          </Paper>
        </TabContext>
        <AudioPlayer
          style={{ width: "100%", margin: "1% 0" }}
          src={eventBgm}
        ></AudioPlayer>
        <GridOut container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={8}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:eventTracker")}
                  </Typography>
                </Grid>
                <Grid item container justifyContent="flex-end">
                  <LinkNoDecoration to={`/eventtracker?id=${eventId}`}>
                    <Grid container alignItems="center">
                      <OpenInNew />
                    </Grid>
                  </LinkNoDecoration>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:storyReader")}
              </Typography>
            </Grid>
            <Grid item container justifyContent="flex-end">
              <LinkNoDecoration to={`/storyreader/eventStory/${event.id}`}>
                <Grid container alignItems="center">
                  <OpenInNew />
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {!!eventMusic && (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={8}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("event:newlyWrittenSong")}
                  </Typography>
                </Grid>
                <Grid item container justifyContent="flex-end">
                  <LinkNoDecoration to={`/music/${eventMusic.musicId}`}>
                    <Grid container alignItems="center">
                      <OpenInNew />
                    </Grid>
                  </LinkNoDecoration>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("event:title.boost")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
                justifyContent="space-between"
              >
                <Grid item xs={6} sm={10}>
                  <Grid container spacing={1} justifyContent="flex-end">
                    <Grid item>
                      <img
                        style={{ maxHeight: "36px" }}
                        src={attrIconMap[eventAttrBonus!.cardAttr]}
                        alt={eventAttrBonus!.cardAttr}
                      ></img>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={5} sm={2}>
                  <Typography>+{eventAttrBonus!.bonusRate}%</Typography>
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
            justifyContent="space-between"
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
                justifyContent="space-between"
              >
                <Grid item xs={6} sm={10}>
                  <Grid container spacing={1} justifyContent="flex-end">
                    {eventBonusCharas.map((chara, idx) => (
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
                  <Typography>
                    +
                    {eventDeckBonus
                      .filter(
                        (it) =>
                          it.cardAttr === undefined &&
                          it.gameCharacterUnitId !== undefined
                      )
                      .reduce((v, it) => Math.max(v, it.bonusRate), 0)}
                    %
                  </Typography>
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
            justifyContent="space-between"
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
                justifyContent="space-between"
              >
                <Grid item xs={6} sm={10}></Grid>
                <Grid item xs={5} sm={2}>
                  <Typography>
                    +
                    {eventDeckBonus
                      .filter(
                        (it) =>
                          it.cardAttr !== undefined &&
                          it.gameCharacterUnitId !== undefined
                      )
                      .reduce((v, it) => Math.max(v, it.bonusRate), 0)}
                    %
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {!!eventCards.filter((ec) => ec.bonusRate).length && (
            <Fragment>
              <Grid
                item
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={3}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("event:boostSpecificCards")}
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={7} md={6} container>
                  <Grid container spacing={2} justifyContent="flex-end">
                    {eventCards
                      .filter((ec) => ec.bonusRate !== 0)
                      .slice(0, 5)
                      .map(({ cardId, bonusRate }) => (
                        <Grid key={cardId} item xs={5} md={4} lg={3}>
                          <Grid container justifyContent="center">
                            <Grid item xs={12}>
                              <Link to={`/card/${cardId}`}>
                                <CardThumb cardId={cardId} />
                              </Link>
                            </Grid>
                            <Grid item>
                              <Typography>+{bonusRate}%</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
              justifyContent="flex-end"
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
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("common:card")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
              justifyContent="flex-end"
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
        </GridOut>
      </ContainerContent>
      {event.eventType === "cheerful_carnival" &&
        !!ccTeams.length &&
        ccSummary && (
          <Fragment>
            <TypographyHeader>
              {t("event:title.cheerful_carnival")}
            </TypographyHeader>
            <ContainerContent maxWidth="md">
              <ContentTrans
                contentKey={`cheerful_carnival_themes:${ccSummary.id}`}
                original={ccSummary.theme}
                originalProps={{ align: "center", variant: "h6" }}
                translatedProps={{ align: "center", variant: "h6" }}
              />
              <GridOut container spacing={1} justifyContent="space-around">
                <Grid item xs={5} md={3} lg={2}>
                  <CheerfulCarnivalTeamIcon
                    eventId={event.id}
                    teamId={ccTeams[0].id}
                  />
                  <ContentTrans
                    contentKey={`cheerful_carnival_teams:${ccTeams[0].id}`}
                    original={ccTeams[0].teamName}
                    originalProps={{ align: "center" }}
                    translatedProps={{ align: "center" }}
                  />
                </Grid>
                <Grid item xs={5} md={3} lg={2}>
                  <CheerfulCarnivalTeamIcon
                    eventId={event.id}
                    teamId={ccTeams[1].id}
                  />
                  <ContentTrans
                    contentKey={`cheerful_carnival_teams:${ccTeams[1].id}`}
                    original={ccTeams[1].teamName}
                    originalProps={{ align: "center" }}
                    translatedProps={{ align: "center" }}
                  />
                </Grid>
              </GridOut>
              <GridOut container direction="column">
                <Grid
                  item
                  container
                  direction="row"
                  wrap="nowrap"
                  justifyContent="space-between"
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
                  justifyContent="space-between"
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
              </GridOut>
            </ContainerContent>
          </Fragment>
        )}
      <TypographyHeader>{t("event:title.timepoint")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
        </GridOut>
      </ContainerContent>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
      {!!linkedVirtualLive && (
        <Fragment>
          <TypographyHeader>{t("common:virtualLive")}</TypographyHeader>
          <ContainerContent maxWidth="md">
            <AgendaView data={linkedVirtualLive} />
          </ContainerContent>
        </Fragment>
      )}
      <TypographyHeader>{t("event:title.rankingRewards")}</TypographyHeader>
      <ContainerContent
        maxWidth="md"
        style={{ maxHeight: 400, overflow: "auto" }}
      >
        <GridOut container direction="column">
          {event.eventRankingRewardRanges.map((rankingReward) => (
            <Fragment key={rankingReward.id}>
              <Grid
                item
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
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
                      justifyContent="center"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ))}
        </GridOut>
      </ContainerContent>
      {!!eventCommentId && (
        <Fragment>
          <TypographyHeader>
            {t("common:comment")} <CommentTextMultiple />
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <Comment contentType="event" contentId={eventCommentId} />
          </ContainerContent>
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
});

export default EventDetail;
