import {
  Box,
  CardMedia,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Typography,
  Container,
  Switch,
  useTheme,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { useInteractiveStyles } from "../styles/interactive";
import { Alert, TabContext, TabPanel } from "@material-ui/lab";
import { Close, Done } from "@material-ui/icons";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import {
  IMusicDanceMembers,
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
} from "../types";
import { musicTagToName, useCachedData, useCharaName } from "../utils";
import { charaIcons } from "../utils/resources";
import { Trans, useTranslation } from "react-i18next";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useTrimMP3 } from "../utils/trimMP3";
import MusicVideoPlayer from "./subs/MusicVideoPlayer";
import { SettingContext } from "../context";
import { ContentTrans, ReleaseCondTrans } from "./subs/ContentTrans";

const useStyles = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "32px",
    margin: theme.spacing(0, 0.25),
  },
  "card-thumb-img": {
    maxWidth: "100%",
    // margin: theme.spacing(0, 1),
  },
  "unit-logo-img": {
    maxWidth: "128px",
    // margin: theme.spacing(0, 1),
  },
  "media-contain": {
    [theme.breakpoints.up("md")]: {
      paddingTop: "60%",
    },
    [theme.breakpoints.down("sm")]: {
      paddingTop: "100%",
    },
    backgroundSize: "contain",
    cursor: "pointer",
    margin: theme.spacing(1, 0),
  },
  tabpanel: {
    padding: 0,
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

const MusicDetail: React.FC<{}> = () => {
  const theme = useTheme();
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const [, humanizeDurationShort] = useDurationI18n();
  const [trimmedMP3URL, trimFailed, setTrimOptions] = useTrimMP3();
  const getCharaName = useCharaName(contentTransMode);

  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");
  // const [gameCharas] = useCachedData<IGameChara>('gameCharacters');
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");
  // const [releaseConds] = useCachedData<IReleaseCondition>("releaseConditions");
  const [danceMembers] = useCachedData<IMusicDanceMembers>("musicDanceMembers");

  const { musicId } = useParams<{ musicId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [music, setMusic] = useState<IMusicInfo>();
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo[]>([]);
  const [musicVocalTypes, setMusicVocalTypes] = useState<string[]>([]);
  const [musicDanceMember, setMusicDanceMember] = useState<
    IMusicDanceMembers
  >();
  const [selectedVocalType, setSelectedVocalType] = useState<number>(0);
  const [vocalPreviewVal, setVocalPreviewVal] = useState<string>("0");
  const [vocalDisabled, setVocalDisabled] = useState<boolean>(false);
  const [diffiInfoTabVal, setDiffiInfoTabVal] = useState<string>("4");
  const [actualPlaybackTime, setActualPlaybackTime] = useState<string>("");
  const [trimSilence, setTrimSilence] = useState<boolean>(false);
  const [trimLoading, setTrimLoading] = useState<boolean>(true);
  const [longMusicPlaybackURL, setLongMusicPlaybackURL] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (music) {
      document.title = t("title:musicDetail", {
        title: getTranslated(
          contentTransMode,
          `music_titles:${musicId}`,
          music.title
        ),
      });
    }
  }, [music, musicId, contentTransMode, getTranslated, t]);

  useEffect(() => {
    if (musics.length) {
      setMusic(musics.find((elem) => elem.id === Number(musicId)));
    }
  }, [musics, musicId]);

  useEffect(() => {
    if (musicVocals.length) {
      setMusicVocal(
        musicVocals.filter((elem) => elem.musicId === Number(musicId))
      );
    }
  }, [musicVocals, musicId]);

  useEffect(() => {
    if (musicVocal.length) {
      setMusicVocalTypes(musicVocal.map((elem) => elem.musicVocalType));
    }
  }, [musicVocal]);

  useEffect(() => {
    if (danceMembers.length) {
      setMusicDanceMember(
        danceMembers.find((elem) => elem.musicId === Number(musicId))
      );
    }
  }, [danceMembers, musicId]);

  useEffect(() => {
    if (
      vocalPreviewVal === "1" &&
      musicVocal &&
      musicVocal[selectedVocalType] &&
      music
    ) {
      const url = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`;
      setTrimOptions({
        sourceURL: url,
        trimDuration: music.fillerSec,
        inclusive: false,
      });
      setTrimLoading(true);
    } else {
      setTrimOptions(undefined);
      setTrimLoading(false);
    }
  }, [
    music,
    musicVocal,
    selectedVocalType,
    vocalPreviewVal,
    setTrimOptions,
    setTrimLoading,
  ]);

  useEffect(() => {
    if (musicVocal && musicVocal[selectedVocalType] && music) {
      setLongMusicPlaybackURL(
        trimSilence
          ? trimmedMP3URL
          : `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`
      );
    } else {
      setLongMusicPlaybackURL(undefined);
    }
  }, [
    music,
    musicVocal,
    selectedVocalType,
    trimSilence,
    trimmedMP3URL,
    setLongMusicPlaybackURL,
  ]);

  // useEffect(() => {
  //   if (musicVocalTypes.length) {
  //     console.log(musicVocalTypes)
  //     setSelectedVocalType(musicVocalTypes[0])
  //   }
  // }, [musicVocalTypes])

  const getVocalCharaIcons: (index: number) => JSX.Element = useCallback(
    (index: number) => {
      return (
        <Fragment>
          {musicVocal[index].characters.map((chara) =>
            chara.characterType === "game_character" ? (
              <img
                key={chara.characterId}
                height="42"
                src={charaIcons[`CharaIcon${chara.characterId}`]}
                alt={`character ${chara.characterId}`}
              ></img>
            ) : (
              <span key={chara.characterId}>
                {outCharas.length
                  ? outCharas.find((elem) => elem.id === chara.characterId)!
                      .name
                  : `Outside Character ${chara.characterId}`}
              </span>
            )
          )}
        </Fragment>
      );
    },
    [musicVocal, outCharas]
  );

  const getCharaIcon: (characterId: number) => JSX.Element = useCallback(
    (characterId) => {
      if (!characterId) return <span></span>;
      return (
        <img
          key={characterId}
          height="42"
          src={charaIcons[`CharaIcon${characterId}`]}
          alt={`character ${characterId}`}
        ></img>
      );
    },
    []
  );

  useEffect(() => {
    if (musicVocal && musicVocal[selectedVocalType] && music) {
      let audio: HTMLAudioElement | undefined = new Audio();
      audio.onloadedmetadata = () => {
        if (!audio) {
          return;
        }

        const durationMsec = (audio.duration - music.fillerSec) * 1000;
        setActualPlaybackTime(
          `${humanizeDurationShort(durationMsec, {
            units: ["s"],
            delimiter: " ",
            spacer: "",
            maxDecimalPoints: 1,
          })} (${humanizeDurationShort(durationMsec, {
            units: ["m", "s"],
            delimiter: " ",
            spacer: "",
            maxDecimalPoints: 1,
          })})`
        );

        audio = undefined;
      };
      audio.preload = "metadata";
      audio.src = `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`;

      return () => {
        audio = undefined;
      };
    }
  }, [musicVocal, selectedVocalType, music, humanizeDurationShort]);

  const VocalTypeSelector: React.FC<{}> = useCallback(() => {
    return (
      <Grid item container xs={12} alignItems="center" justify="space-between">
        <Grid item xs={12} md={2}>
          <Typography classes={{ root: interactiveClasses.caption }}>
            {t("music:vocal")}
          </Typography>
        </Grid>
        <Grid item container xs={12} md={9} spacing={1}>
          <FormControl disabled={vocalDisabled}>
            <RadioGroup
              row
              aria-label="vocal type"
              name="vocal-type"
              value={selectedVocalType}
              onChange={(e, v) => setSelectedVocalType(Number(v))}
            >
              {musicVocalTypes.map((elem, idx) => (
                <FormControlLabel
                  key={`vocal-type-${idx}`}
                  value={idx}
                  control={<Radio color="primary"></Radio>}
                  label={getVocalCharaIcons(idx)}
                  labelPlacement="end"
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    );
  }, [
    interactiveClasses.caption,
    t,
    vocalDisabled,
    selectedVocalType,
    musicVocalTypes,
    getVocalCharaIcons,
  ]);

  return music &&
    musicVocals.length &&
    musicDiffis.length &&
    // releaseConds.length &&
    danceMembers.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getTranslated(
          contentTransMode,
          `music_titles:${musicId}`,
          music.title
        )}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Alert severity="warning">
          <Trans i18nKey="music:alert[0]" components={{ b: <b /> }} />
        </Alert>
        <CardMedia
          onClick={() => {
            setActiveIdx(0);
            setVisible(true);
          }}
          classes={{ root: classes["media-contain"] }}
          image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`}
        ></CardMedia>
        <Paper className={interactiveClasses.container}>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("common:type")}
                </Typography>
              </Grid>
              <Grid item container xs={12} md={9} spacing={1}>
                <RadioGroup
                  row
                  aria-label="vocal preview"
                  name="vocal-preview"
                  value={vocalPreviewVal}
                  onChange={(e, v) => {
                    setVocalPreviewVal(v);
                    setVocalDisabled(false);
                  }}
                >
                  <FormControlLabel
                    value="0"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:vocalTab.title[0]")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="1"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:vocalTab.title[1]")}
                    labelPlacement="end"
                  />
                  {music.categories.includes("original") ||
                  music.categories.includes("mv_2d") ? (
                    <FormControlLabel
                      value="2"
                      control={<Radio color="primary"></Radio>}
                      label={t("music:vocalTab.title[2]")}
                      labelPlacement="end"
                    />
                  ) : null}
                </RadioGroup>
              </Grid>
            </Grid>
            <VocalTypeSelector />
            {vocalPreviewVal === "1" ? (
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justify="space-between"
              >
                <Grid item xs={12} md={2}>
                  <Typography classes={{ root: interactiveClasses.caption }}>
                    {t("music:skipBeginningSilence")}
                  </Typography>
                </Grid>
                <Grid item container xs={12} md={9} spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={trimSilence}
                        onChange={() => setTrimSilence((v) => !v)}
                      />
                    }
                    label={
                      trimFailed ? (
                        // failed
                        <Close style={{ color: theme.palette.error.main }} />
                      ) : trimmedMP3URL ? (
                        // success
                        <Done style={{ color: theme.palette.success.main }} />
                      ) : trimLoading ? (
                        // loading
                        <CircularProgress
                          size="1em"
                          style={{ marginLeft: "0.2em" }}
                        />
                      ) : null
                    }
                  />
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </Paper>
        {vocalPreviewVal === "0" &&
        musicVocalTypes.length &&
        musicVocal.length ? (
          <audio
            controls
            style={{ width: "100%" }}
            src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/short/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}_short.mp3`}
          />
        ) : null}
        {vocalPreviewVal === "1" &&
        musicVocalTypes.length &&
        musicVocal.length ? (
          <Box
            style={{
              position: "relative",
              lineHeight: "0",
            }}
          >
            <audio
              controls
              style={{
                width: "100%",
                opacity: longMusicPlaybackURL ? undefined : "0.8",
              }}
              src={longMusicPlaybackURL}
            />
            {longMusicPlaybackURL ? null : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
                  width: "100%",
                  height: "100%",
                  cursor: trimFailed ? "not-allowed" : "wait",
                }}
              >
                {trimFailed ? null : <CircularProgress size={32} />}
              </Box>
            )}
          </Box>
        ) : null}
        {vocalPreviewVal === "2" &&
        musicVocalTypes.length &&
        musicVocal.length ? (
          <MusicVideoPlayer
            audioPath={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`}
            videoPath={`${
              process.env.REACT_APP_ASSET_DOMAIN
            }/file/sekai-assets/live/2dmode/${
              music.categories.includes("original")
                ? "original_mv"
                : music.categories.includes("mv_2d")
                ? "sekai_mv"
                : ""
            }/${String(music.id).padStart(4, "0")}_rip/${String(
              music.id
            ).padStart(4, "0")}.mp4`}
            onPlay={() => setVocalDisabled(true)}
            onPause={() => setVocalDisabled(false)}
            onEnded={() => setVocalDisabled(false)}
          />
        ) : null}

        <Grid className={classes["grid-out"]} container direction="column">
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
            <Typography>{music.id}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
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
              <ContentTrans
                mode={contentTransMode}
                contentKey={`music_titles:${musicId}`}
                original={music.title}
                originalProps={{ align: "right" }}
                translatedProps={{ align: "right" }}
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
              {t("music:tag", {
                count: musicTags.filter((elem) => elem.musicId === music.id)
                  .length,
              })}
            </Typography>
            <Grid item>
              {musicTags
                .filter((elem) => elem.musicId === music.id)
                .map((elem) => (
                  <Typography align="right" key={`music-tag-${elem.musicTag}`}>
                    {musicTagToName[elem.musicTag] || elem.musicTag}
                  </Typography>
                ))}
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
              {t("music:category", { count: music.categories.length })}
            </Typography>
            {music.categories.map((elem) => (
              <Typography key={`music-cat-${elem}`}>
                {t(`music:categoryType.${elem}`)}
              </Typography>
            ))}
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
              {t("music:actualPlaybackTime")}
            </Typography>
            <Typography>{actualPlaybackTime}</Typography>
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
              {t("music:arranger")}
            </Typography>
            <Typography>{music.arranger}</Typography>
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
              {t("music:composer")}
            </Typography>
            <Typography>{music.composer}</Typography>
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
              {t("music:lyricist")}
            </Typography>
            <Typography>{music.lyricist}</Typography>
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
              {musicDanceMember
                ? t("music:danceMember", { count: music.dancerCount })
                : t("music:dancerCount")}
            </Typography>
            <Grid item>
              {musicDanceMember
                ? Array.from({ length: music.dancerCount }).map((_, idx) =>
                    getCharaIcon(
                      musicDanceMember[
                        `characterId${idx + 1}` as
                          | "characterId1"
                          | "characterId2"
                          | "characterId3"
                          | "characterId4"
                          | "characterId5"
                      ]!
                    )
                  )
                : music.dancerCount}
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
              {t("common:startAt")}
            </Typography>
            <Typography>
              {new Date(music.publishedAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("music:vocal", { count: musicVocal.length })}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Paper className={interactiveClasses.container}>
          <Grid container direction="column" spacing={1}>
            <Grid item xs={12} alignItems="center" justify="space-between">
              <FormControl disabled={vocalDisabled}>
                <RadioGroup
                  row
                  aria-label="vocal type"
                  name="vocal-type"
                  value={selectedVocalType}
                  onChange={(e, v) => setSelectedVocalType(Number(v))}
                >
                  {musicVocalTypes.map((elem, idx) => (
                    <FormControlLabel
                      key={`vocal-type-${idx}`}
                      value={idx}
                      control={<Radio color="primary"></Radio>}
                      label={getVocalCharaIcons(idx)}
                      labelPlacement="end"
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        {musicVocal.length && musicVocal[selectedVocalType] ? (
          <Grid className={classes["grid-out"]} container direction="column">
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:character", {
                  count: musicVocal[selectedVocalType].characters.length,
                })}
              </Typography>
              {/* <Grid item>{getVocalCharaIcons(selectedVocalType)}</Grid> */}
              <Grid item>
                <Grid container direction="column">
                  {musicVocal[selectedVocalType].characters.map((chara) => (
                    <Grid item>
                      <Typography align="right">
                        {getCharaName(chara.characterId)}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid item>
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:releaseCondition")}
                  </Typography>
                </Grid>
                <Grid item>
                  <ReleaseCondTrans
                    mode={contentTransMode}
                    releaseCondId={
                      musicVocal[selectedVocalType].releaseConditionId
                    }
                    originalProps={{ align: "right" }}
                    translatedProps={{ align: "right" }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid item container direction="row" justify="space-between">
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("music:vocalType")}
              </Typography>
              <Typography>
                {musicVocal[selectedVocalType].musicVocalType}
              </Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
        ) : null}
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("music:difficulty", {
          count: musicDiffis.filter((elem) => elem.musicId === Number(musicId))
            .length,
        })}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <TabContext value={diffiInfoTabVal}>
          <Paper className={interactiveClasses.container}>
            <Tabs
              value={diffiInfoTabVal}
              onChange={(e, v) => {
                setDiffiInfoTabVal(v);
              }}
              variant="scrollable"
              scrollButtons="desktop"
            >
              {musicDiffis
                .filter((elem) => elem.musicId === Number(musicId))
                .map((elem, idx) => (
                  <Tab
                    key={`diffi-info-tab-${idx}`}
                    label={elem.musicDifficulty}
                    value={String(idx)}
                  ></Tab>
                ))}
            </Tabs>
          </Paper>
          {musicDiffis
            .filter((elem) => elem.musicId === Number(musicId))
            .map((elem, idx) => (
              <TabPanel
                value={String(idx)}
                key={`diffi-info-tab-panel-${idx}`}
                style={{ paddingLeft: 0, paddingRight: 0 }}
              >
                <Grid container direction="column">
                  <Grid item container direction="row" justify="space-between">
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("common:level")}
                    </Typography>
                    <Grid item>{elem.playLevel}</Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid item container direction="row" justify="space-between">
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("music:noteCount")}
                    </Typography>
                    <Grid item>{elem.noteCount}</Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 600 }}
                        >
                          {t("common:releaseCondition")}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <ReleaseCondTrans
                          mode={contentTransMode}
                          releaseCondId={elem.releaseConditionId}
                          originalProps={{ align: "right" }}
                          translatedProps={{ align: "right" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                </Grid>
              </TabPanel>
            ))}
        </TabContext>
        {/* <Divider style={{ margin: "1% 0" }} /> */}
      </Container>

      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
            alt: "music jacket",
            downloadUrl: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
          },
        ]}
        zIndex={2000}
        activeIndex={activeIdx}
        downloadable
        downloadInNewWindow
        onMaskClick={() => setVisible(false)}
        onChange={(_, idx) => setActiveIdx(idx)}
        zoomSpeed={0.25}
      />
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, music {musicId} does not exist.
    </div>
  );
};

export default MusicDetail;
