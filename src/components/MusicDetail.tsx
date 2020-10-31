import {
  Box,
  CardMedia,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
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
import { Alert, TabContext, TabPanel } from "@material-ui/lab";
import { Close, Done } from "@material-ui/icons";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import {
  ContentTransModeType,
  IMusicDanceMembers,
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
  IReleaseCondition,
} from "../types";
import { musicCategoryToName, musicTagToName, useCachedData } from "../utils";
import { charaIcons } from "../utils/resources";
import { Trans, useTranslation } from "react-i18next";
import { useAssetI18n } from "../utils/i18n";
import { useDurationI18n } from "../utils/i18nDuration";
import { useTrimMP3 } from "../utils/trimMP3";
import MusicVideoPlayer from "./subs/MusicVideoPlayer";

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
      paddingTop: "90%",
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

const MusicDetail: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const theme = useTheme();
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { assetT } = useAssetI18n();
  const [, humanizeDurationShort] = useDurationI18n();
  const [trimmedMP3URL, trimFailed, setTrimOptions] = useTrimMP3();

  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [musicDiffis] = useCachedData<IMusicDifficultyInfo>(
    "musicDifficulties"
  );
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");
  // const [gameCharas] = useCachedData<ICharaProfile>('gameCharacters');
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");
  const [releaseConds] = useCachedData<IReleaseCondition>("releaseConditions");
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
  const [vocalTabVal, setVocalTabVal] = useState<string>("0");
  const [vocalDisabled, setVocalDisabled] = useState<boolean>(false);
  const [vocalInfoTabVal, setVocalInfoTabVal] = useState<string>("0");
  const [diffiInfoTabVal, setDiffiInfoTabVal] = useState<string>("4");
  const [actualPlaybackTime, setActualPlaybackTime] = useState<string>("");
  const [trimSilence, setTrimSilence] = useState<boolean>(false);
  const [trimLoading, setTrimLoading] = useState<boolean>(true);
  const [longMusicPlaybackURL, setLongMusicPlaybackURL] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (music) {
      const title =
        contentTransMode === "translated"
          ? assetT(`music_titles:${musicId}`, music.title)
          : music.title;
      document.title = t("title:musicDetail", {
        title,
      });
    }
  }, [music, musicId, contentTransMode, assetT, t]);

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
      vocalTabVal === "1" &&
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
    vocalTabVal,
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
              <span>
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

  const VocalTypeSelector: JSX.Element = useMemo(() => {
    return (
      <FormControl
        disabled={vocalDisabled}
        style={{ marginLeft: "18.5px", marginTop: "1%" }}
      >
        <FormLabel>Vocal Type</FormLabel>
        <RadioGroup
          row
          aria-label="vocal type"
          name="vocal-type"
          defaultValue="0"
          onChange={(e, v) => setSelectedVocalType(Number(v))}
        >
          {musicVocalTypes.map((elem, idx) => (
            <FormControlLabel
              key={`vocal-type-${idx}`}
              value={String(idx)}
              control={<Radio color="primary"></Radio>}
              label={getVocalCharaIcons(idx)}
              labelPlacement="end"
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }, [getVocalCharaIcons, musicVocalTypes, vocalDisabled]);

  return music &&
    musicVocals.length &&
    musicDiffis.length &&
    releaseConds.length &&
    danceMembers.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {contentTransMode === "original"
          ? music.title
          : contentTransMode === "translated"
          ? assetT(`music_titles:${musicId}`, music.title)
          : music.title}
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
        <TabContext value={vocalTabVal}>
          <Paper>
            <Tabs
              value={vocalTabVal}
              onChange={(e, v) => {
                setVocalTabVal(v);
                setVocalDisabled(false);
              }}
              variant="scrollable"
              scrollButtons="desktop"
            >
              <Tab label="Short Version" value="0"></Tab>
              <Tab label="Long Version" value="1"></Tab>
              {music.categories.includes("original") ||
              music.categories.includes("mv_2d") ? (
                <Tab label="Music Video" value="2"></Tab>
              ) : null}
            </Tabs>
            {VocalTypeSelector}
            <TabPanel value="0">
              {musicVocalTypes.length && musicVocal.length ? (
                <Fragment>
                  <audio
                    controls
                    style={{ width: "100%" }}
                    src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/short/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}_short.mp3`}
                  ></audio>
                </Fragment>
              ) : null}
            </TabPanel>
            <TabPanel value="1">
              {musicVocalTypes.length && musicVocal.length ? (
                <Fragment>
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
                    ></audio>
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={trimSilence}
                        onChange={() => setTrimSilence((v) => !v)}
                      />
                    }
                    label={
                      <Box display="flex" flexWrap="nowrap" alignItems="center">
                        <Typography style={{ paddingRight: "0.2em" }}>
                          {t("music:skipBeginningSilence")}
                        </Typography>
                        {trimFailed ? (
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
                        ) : null}
                      </Box>
                    }
                  ></FormControlLabel>
                </Fragment>
              ) : null}
            </TabPanel>
            <TabPanel value="2">
              {musicVocalTypes.length && musicVocal.length ? (
                <Box>
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
                </Box>
              ) : null}
            </TabPanel>
          </Paper>
        </TabContext>

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
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:title")}
            </Typography>
            <Typography>
              {contentTransMode === "original"
                ? music.title
                : contentTransMode === "translated"
                ? assetT(`music_titles:${musicId}`, music.title)
                : music.title}
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
                {musicCategoryToName[elem] || elem}
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
        <Box>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("music:vocal", { count: musicVocal.length })}
          </Typography>
          <TabContext value={vocalInfoTabVal}>
            <Paper>
              <Tabs
                value={vocalInfoTabVal}
                onChange={(e, v) => {
                  setVocalInfoTabVal(v);
                }}
                variant="scrollable"
                scrollButtons="desktop"
              >
                {musicVocal.map((elem, idx) => (
                  <Tab
                    key={`vocal-info-tab-${idx}`}
                    label={elem.caption}
                    value={String(idx)}
                  ></Tab>
                ))}
              </Tabs>
              {musicVocal.map((elem, idx) => (
                <TabPanel
                  value={String(idx)}
                  key={`vocal-info-tab-panel-${idx}`}
                >
                  <Grid container direction="column">
                    <Grid
                      item
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:character", {
                          count: elem.characters.length,
                        })}
                      </Typography>
                      <Grid item>{getVocalCharaIcons(idx)}</Grid>
                    </Grid>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justify="space-between"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:releaseCondition")}
                      </Typography>
                      <Typography>
                        {
                          releaseConds.find(
                            (cond) => cond.id === elem.releaseConditionId
                          )?.sentence
                        }
                      </Typography>
                    </Grid>
                    <Divider style={{ margin: "1% 0" }} />
                    <Grid
                      item
                      container
                      direction="row"
                      justify="space-between"
                    >
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("music:vocalType")}
                      </Typography>
                      <Typography>{elem.musicVocalType}</Typography>
                    </Grid>
                    <Divider style={{ margin: "1% 0" }} />
                  </Grid>
                </TabPanel>
              ))}
            </Paper>
          </TabContext>
        </Box>
        <Divider style={{ margin: "1% 0" }} />
        <Box>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("music:difficulty", {
              count: musicDiffis.filter(
                (elem) => elem.musicId === Number(musicId)
              ).length,
            })}
          </Typography>
          <TabContext value={diffiInfoTabVal}>
            <Paper>
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
              {musicDiffis
                .filter((elem) => elem.musicId === Number(musicId))
                .map((elem, idx) => (
                  <TabPanel
                    value={String(idx)}
                    key={`diffi-info-tab-panel-${idx}`}
                  >
                    <Grid container direction="column">
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-between"
                      >
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 600 }}
                        >
                          {t("common:level")}
                        </Typography>
                        <Grid item>{elem.playLevel}</Grid>
                      </Grid>
                      <Divider style={{ margin: "1% 0" }} />
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-between"
                      >
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 600 }}
                        >
                          {t("music:noteCount")}
                        </Typography>
                        <Grid item>{elem.noteCount}</Grid>
                      </Grid>
                      <Divider style={{ margin: "1% 0" }} />
                      <Grid
                        item
                        container
                        direction="row"
                        justify="space-between"
                      >
                        <Typography
                          variant="subtitle1"
                          style={{ fontWeight: 600 }}
                        >
                          {t("common:releaseCondition")}
                        </Typography>
                        <Typography>
                          {
                            releaseConds.find(
                              (cond) => cond.id === elem.releaseConditionId
                            )?.sentence
                          }
                        </Typography>
                      </Grid>
                      {/* <Divider style={{ margin: "1% 0" }} /> */}
                    </Grid>
                  </TabPanel>
                ))}
            </Paper>
          </TabContext>
          <Divider style={{ margin: "1% 0" }} />
        </Box>
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
