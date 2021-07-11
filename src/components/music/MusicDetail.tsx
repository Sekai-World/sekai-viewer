import {
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
  Link,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { useInteractiveStyles } from "../../styles/interactive";
import { Alert, TabContext, TabPanel } from "@material-ui/lab";
import { Close, Done, OpenInNew } from "@material-ui/icons";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
// import AudioPlayer from "react-h5-audio-player";
// import "react-h5-audio-player/lib/styles.css";
import {
  IMusicAchievement,
  IMusicDanceMembers,
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
} from "../../types";
import { getRemoteAssetURL, useCachedData, useMusicTagName } from "../../utils";
import { charaIcons } from "../../utils/resources";
import { Trans, useTranslation } from "react-i18next";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { useDurationI18n } from "../../utils/i18nDuration";
// import { useTrimMP3 } from "../../utils/trimMP3";
import MusicVideoPlayer from "../subs/MusicVideoPlayer";
import { SettingContext } from "../../context";
import { ContentTrans, ReleaseCondTrans } from "../subs/ContentTrans";
import ResourceBox from "../subs/ResourceBox";
import AudioPlayer from "./AudioPlayer";
import { Howl } from "howler";
import { saveAs } from "file-saver";
import AdSense from "../subs/AdSense";
import Image from "material-ui-image";
import { useStrapi } from "../../utils/apiClient";
import { CommentTextMultiple } from "mdi-material-ui";
import Comment from "../comment/Comment";

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
  tabpanel: {
    padding: 0,
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

const MusicDetail: React.FC<{}> = () => {
  // const theme = useTheme();
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const [, humanizeDurationShort] = useDurationI18n();
  // const [trimmedMP3URL, trimFailed, setTrimOptions] = useTrimMP3();
  const getCharaName = useCharaName();
  const getOriginalCharaName = useCharaName("original");
  const musicTagToName = useMusicTagName(contentTransMode);
  const { getMusic } = useStrapi();

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
  const [musicAchievements] = useCachedData<IMusicAchievement>(
    "musicAchievements"
  );

  const { musicId } = useParams<{ musicId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [music, setMusic] = useState<IMusicInfo>();
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo[]>([]);
  const [musicVocalTypes, setMusicVocalTypes] = useState<string[]>([]);
  const [
    musicDanceMember,
    setMusicDanceMember,
  ] = useState<IMusicDanceMembers>();
  const [
    selectedPreviewVocalType,
    setSelectedPreviewVocalType,
  ] = useState<number>(0);
  const [selectedVocalType, setSelectedVocalType] = useState<number>(0);
  const [vocalPreviewVal, setVocalPreviewVal] = useState<string>("1");
  const [vocalDisabled, setVocalDisabled] = useState<boolean>(false);
  const [diffiInfoTabVal, setDiffiInfoTabVal] = useState<string>("4");
  const [actualPlaybackTime, setActualPlaybackTime] = useState<string>("");
  const [trimSilence, setTrimSilence] = useState<boolean>(true);
  // const [trimLoading, setTrimLoading] = useState<boolean>(false);
  const [longMusicPlaybackURL, setLongMusicPlaybackURL] = useState<
    string | undefined
  >();
  // const [
  //   trimmedLongMusicPlaybackURL,
  //   setTrimmedLongMusicPlaybackURL,
  // ] = useState<string | undefined>();
  const [shortMusicPlaybackURL, setShortMusicPlaybackURL] = useState<
    string | undefined
  >();
  const [musicVideoURL, setMusicVideoURL] = useState<string>("");
  const [musicCommentId, setMusicCommentId] = useState<number>(0);
  const [format, setFormat] = useState<"mp3" | "flac">("mp3");

  useEffect(() => {
    if (music) {
      document.title = t("title:musicDetail", {
        title: getTranslated(`music_titles:${musicId}`, music.title),
      });
    }
  }, [music, musicId, contentTransMode, getTranslated, t]);

  useEffect(() => {
    if (musics && musics.length) {
      setMusic(musics.find((elem) => elem.id === Number(musicId)));
    }
  }, [musics, musicId]);

  useEffect(() => {
    if (musicVocals && musicVocals.length) {
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
    if (danceMembers && danceMembers.length) {
      setMusicDanceMember(
        danceMembers.find((elem) => elem.musicId === Number(musicId))
      );
    }
  }, [danceMembers, musicId]);

  useEffect(() => {
    if (music && musicVocal && musicVocal[selectedPreviewVocalType]) {
      getRemoteAssetURL(
        `music/long/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}.${format}`,
        setLongMusicPlaybackURL,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `music/short/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}_short.${format}`,
        setShortMusicPlaybackURL,
        window.isChinaMainland
      );
    }
  }, [format, music, musicVocal, selectedPreviewVocalType]);

  useEffect(() => {
    if (music) {
      const job = async () => {
        const musicStrapi = await getMusic(music.id);
        if (musicStrapi) {
          setMusicCommentId(musicStrapi.id);
        }
      };

      job();
    }
  }, [getMusic, music]);

  useEffect(() => {
    if (
      music &&
      musicVocal &&
      musicVocal[selectedPreviewVocalType] &&
      (vocalPreviewVal === "original" || vocalPreviewVal === "mv_2d")
    ) {
      setMusicVideoURL(
        `live/2dmode/${
          vocalPreviewVal === "original"
            ? "original_mv"
            : vocalPreviewVal === "mv_2d"
            ? "sekai_mv"
            : ""
        }/${String(music.id).padStart(4, "0")}_rip`
      );
    }
  }, [music, musicVocal, selectedPreviewVocalType, vocalPreviewVal]);

  // useEffect(() => {
  //   if (
  //     vocalPreviewVal === "1" &&
  //     musicVocal &&
  //     musicVocal[selectedPreviewVocalType] &&
  //     music &&
  //     longMusicPlaybackURL &&
  //     trimSilence &&
  //     !trimmedMP3URL
  //   ) {
  //     setTrimOptions({
  //       sourceURL: longMusicPlaybackURL,
  //       trimDuration: music.fillerSec,
  //       inclusive: false,
  //     });
  //     setTrimLoading(true);
  //   }
  // }, [
  //   music,
  //   musicVocal,
  //   selectedPreviewVocalType,
  //   vocalPreviewVal,
  //   setTrimOptions,
  //   setTrimLoading,
  //   longMusicPlaybackURL,
  //   trimSilence,
  //   trimmedMP3URL,
  // ]);

  // useEffect(() => {
  //   if (
  //     musicVocal &&
  //     musicVocal[selectedPreviewVocalType] &&
  //     music &&
  //     trimmedMP3URL
  //   ) {
  //     setTrimmedLongMusicPlaybackURL(trimmedMP3URL);
  //     setTrimLoading(false);
  //   } else {
  //     setTrimmedLongMusicPlaybackURL(undefined);
  //   }
  // }, [music, musicVocal, selectedPreviewVocalType, trimmedMP3URL]);

  const getVocalCharaIcons: (index: number) => JSX.Element = useCallback(
    (index: number) => {
      return (
        <Grid container spacing={1} alignItems="center">
          {musicVocal[index].characters.map((chara) =>
            chara.characterType === "game_character" ? (
              <Grid item key={`chara-${chara.characterId}`}>
                <img
                  key={chara.characterId}
                  height="42"
                  src={charaIcons[`CharaIcon${chara.characterId}`]}
                  alt={`character ${chara.characterId}`}
                ></img>
              </Grid>
            ) : (
              <Grid item key={`outchara-${chara.characterId}`}>
                <Typography>
                  {outCharas && outCharas.length
                    ? outCharas.find((elem) => elem.id === chara.characterId)!
                        .name
                    : `Outside Character ${chara.characterId}`}
                </Typography>
              </Grid>
            )
          )}
        </Grid>
      );
    },
    [musicVocal, outCharas]
  );

  const [musicJacket, setMusicJacket] = useState<string>("");

  useEffect(() => {
    if (music) {
      if (
        music.id === 19 &&
        musicVocalTypes.length &&
        musicVocalTypes[selectedPreviewVocalType].includes("original")
      ) {
        // console.log(musicVocalTypes[selectedPreviewVocalType]);
        getRemoteAssetURL(
          `music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}_org.webp`,
          setMusicJacket,
          window.isChinaMainland
        );
      } else {
        getRemoteAssetURL(
          `music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
          setMusicJacket,
          window.isChinaMainland
        );
      }
    }
  }, [music, musicVocalTypes, selectedPreviewVocalType]);

  const getCharaIcon: (
    characterId: number,
    height?: number
  ) => JSX.Element = useCallback((characterId, height = 42) => {
    if (!characterId) return <span></span>;
    return (
      <Grid item key={`chara-${characterId}`}>
        <img
          key={characterId}
          height={height}
          src={charaIcons[`CharaIcon${characterId}`]}
          alt={`character ${characterId}`}
        ></img>
      </Grid>
    );
  }, []);

  const onPlay = useCallback(() => {
    if ("mediaSession" in window.navigator) {
      window.navigator.mediaSession!.metadata = new MediaMetadata({
        title: music?.title,
        artist: music?.composer,
        album: musicVocal[selectedPreviewVocalType].caption,
        artwork: [
          {
            src: musicJacket,
            sizes: "740x740",
            type: "image/webp",
          },
        ],
      });
    }
  }, [music, musicVocal, musicJacket, selectedPreviewVocalType]);

  const getActalPlaybackTime = useCallback(
    (howl: Howl) => {
      if (!music || !!actualPlaybackTime) return;
      const durationMsec = (howl.duration() - music.fillerSec) * 1000;
      // if (trimmedLongMusicPlaybackURL && trimSilence)
      //   durationMsec = howl.duration() * 1000;
      // else durationMsec = (howl.duration() - music.fillerSec) * 1000;
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
    },
    [actualPlaybackTime, humanizeDurationShort, music]
  );

  const onSave = useCallback(
    (src: string) => {
      // console.log(src);
      const vocals = musicVocal[
        selectedPreviewVocalType
      ].characters.map((chara) =>
        chara.characterType === "game_character"
          ? getOriginalCharaName(chara.characterId)
          : outCharas && outCharas.length
          ? outCharas.find((elem) => elem.id === chara.characterId)!.name
          : chara.characterId
      );
      saveAs(
        src,
        `${music?.title}-${
          vocalPreviewVal === "1" ? "full" : "preview"
        }-${vocals.join("+")}.${format}`
      );
    },
    [
      format,
      getOriginalCharaName,
      music?.title,
      musicVocal,
      outCharas,
      selectedPreviewVocalType,
      vocalPreviewVal,
    ]
  );

  const VocalTypeSelector: React.FC<{
    vocalType: number;
    onSelect: (value: number) => void;
  }> = useCallback(
    ({ vocalType, onSelect }) => {
      return (
        <Grid
          item
          container
          xs={12}
          alignItems="center"
          justify="space-between"
        >
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
                value={vocalType}
                onChange={(e, v) => onSelect(Number(v))}
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
    },
    [
      interactiveClasses.caption,
      t,
      vocalDisabled,
      musicVocalTypes,
      getVocalCharaIcons,
    ]
  );

  return music && musicVocals && musicVocals.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getTranslated(`music_titles:${musicId}`, music.title)}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Alert severity="warning">
          <Trans i18nKey="music:alert[0]" components={{ b: <b /> }} />
        </Alert>
        <Grid container justify="center">
          <Grid item xs={12} sm={6}>
            <Image
              onClick={() => {
                setActiveIdx(0);
                setVisible(true);
              }}
              className={interactiveClasses.pointer}
              src={musicJacket}
              color=""
            ></Image>
          </Grid>
        </Grid>
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
                  {music.categories
                    .filter((cat) => ["original", "mv_2d"].includes(cat))
                    .map((cat) => (
                      <FormControlLabel
                        value={cat}
                        control={<Radio color="primary"></Radio>}
                        label={t(`music:categoryType.${cat}`)}
                        labelPlacement="end"
                        key={cat}
                      />
                    ))}
                </RadioGroup>
              </Grid>
            </Grid>
            <VocalTypeSelector
              vocalType={selectedPreviewVocalType}
              onSelect={(v) => {
                setSelectedPreviewVocalType(v);
                // setTrimOptions(undefined);
              }}
            />
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("music:fileFormat.caption")}
                </Typography>
              </Grid>
              <Grid item container xs={12} md={9} spacing={1}>
                <RadioGroup
                  row
                  aria-label="music file format"
                  name="file-format"
                  value={format}
                  onChange={(e, v) => {
                    setFormat(v as "mp3");
                  }}
                >
                  <FormControlLabel
                    value="mp3"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:fileFormat.mp3")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="flac"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:fileFormat.flac")}
                    labelPlacement="end"
                  />
                </RadioGroup>
              </Grid>
            </Grid>
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
                        // disabled={trimFailed || trimLoading}
                      />
                    }
                    label={null}
                    // label={
                    //   trimFailed ? (
                    //     // failed
                    //     <Close style={{ color: theme.palette.error.main }} />
                    //   ) : trimmedMP3URL ? (
                    //     // success
                    //     <Done style={{ color: theme.palette.success.main }} />
                    //   ) : trimLoading ? (
                    //     // loading
                    //     <CircularProgress
                    //       size="1em"
                    //       style={{ marginLeft: "0.2em" }}
                    //     />
                    //   ) : null
                    // }
                  />
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </Paper>
        {vocalPreviewVal === "0" &&
          musicVocalTypes.length &&
          musicVocal.length &&
          shortMusicPlaybackURL && (
            <AudioPlayer
              src={shortMusicPlaybackURL}
              onPlay={onPlay}
              onSave={onSave}
            />
          )}
        {vocalPreviewVal === "1" &&
          musicVocalTypes.length &&
          musicVocal.length &&
          longMusicPlaybackURL && (
            <AudioPlayer
              src={longMusicPlaybackURL}
              onPlay={onPlay}
              onLoad={getActalPlaybackTime}
              onSave={onSave}
              offset={trimSilence ? music.fillerSec : 0}
            />
          )}
        {["original", "mv_2d"].includes(vocalPreviewVal) &&
          musicVocalTypes.length &&
          musicVocal.length &&
          longMusicPlaybackURL && (
            <MusicVideoPlayer
              audioPath={longMusicPlaybackURL}
              videoPath={musicVideoURL}
              onPlay={() => setVocalDisabled(true)}
              onPause={() => setVocalDisabled(false)}
              onEnded={() => setVocalDisabled(false)}
            />
          )}

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
                count:
                  musicTags &&
                  musicTags.filter((elem) => elem.musicId === music.id).length,
              })}
            </Typography>
            <Grid item>
              {musicTags &&
                musicTags
                  .filter((elem) => elem.musicId === music.id)
                  .map((elem) => (
                    <Typography
                      align="right"
                      key={`music-tag-${elem.musicTag}`}
                    >
                      {musicTagToName[elem.musicTag as "all"] || elem.musicTag}
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
            <Grid item>
              {music.categories.map((elem) => (
                <Typography align="right" key={`music-cat-${elem}`}>
                  {t(`music:categoryType.${elem}`)}
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
          {musicDanceMember && (
            <Fragment>
              <Divider style={{ margin: "1% 0" }} />
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {t("music:danceMember", {
                    count: Object.keys(musicDanceMember).filter((key) =>
                      key.startsWith("characterId")
                    ).length,
                  })}
                </Typography>
                <Grid item>
                  <Grid container spacing={1}>
                    {Object.keys(musicDanceMember)
                      .filter((key) => key.startsWith("characterId"))
                      .map((key) =>
                        getCharaIcon(
                          musicDanceMember[
                            key as
                              | "characterId1"
                              | "characterId2"
                              | "characterId3"
                              | "characterId4"
                              | "characterId5"
                          ]!
                        )
                      )}
                  </Grid>
                </Grid>
              </Grid>
            </Fragment>
          )}
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
      <Container className={layoutClasses.content} maxWidth="md">
        <Paper className={interactiveClasses.container}>
          <Grid container direction="column" spacing={1}>
            <VocalTypeSelector
              vocalType={selectedVocalType}
              onSelect={(v) => setSelectedVocalType(v)}
            />
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
                  {musicVocal[selectedVocalType].characters.map((chara) =>
                    chara.characterType === "game_character" ? (
                      <Grid item key={`chara-${chara.characterId}`}>
                        <Typography align="right">
                          {getCharaName(chara.characterId)}
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item key={`outchara-${chara.characterId}`}>
                        <Typography align="right">
                          {outCharas && outCharas.length
                            ? outCharas.find(
                                (elem) => elem.id === chara.characterId
                              )!.name
                            : `Outside Character ${chara.characterId}`}
                        </Typography>
                      </Grid>
                    )
                  )}
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
            <Grid item>
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("music:vocalType")}
                  </Typography>
                </Grid>
                <Grid item>
                  <ContentTrans
                    contentKey={`music_vocal:${musicVocal[selectedVocalType].musicVocalType}`}
                    original={musicVocal[selectedVocalType].musicVocalType}
                    originalProps={{ align: "right" }}
                    translatedProps={{ align: "right" }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
        ) : null}
      </Container>
      <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      />
      <Typography variant="h6" className={layoutClasses.header}>
        {t("music:achievement")}
      </Typography>
      {musicAchievements && !!musicAchievements.length && (
        <Container className={layoutClasses.content} maxWidth="md">
          <Grid container direction="column">
            <Grid item container justify="space-between" alignItems="center">
              <Grid item xs={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {t("music:scoreRankAchievement.title")}
                </Typography>
              </Grid>
              <Grid item xs={9} container spacing={1}>
                <Grid item xs={6} md={3} container direction="column">
                  <Grid item>
                    <Typography align="center">
                      {t("music:scoreRankAchievement.rankC")}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ResourceBox
                      resourceBoxId={musicAchievements[0].resourceBoxId}
                      resourceBoxPurpose="music_achievement"
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6} md={3} container direction="column">
                  <Grid item>
                    <Typography align="center">
                      {t("music:scoreRankAchievement.rankB")}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ResourceBox
                      resourceBoxId={musicAchievements[1].resourceBoxId}
                      resourceBoxPurpose="music_achievement"
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6} md={3} container direction="column">
                  <Grid item>
                    <Typography align="center">
                      {t("music:scoreRankAchievement.rankA")}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ResourceBox
                      resourceBoxId={musicAchievements[2].resourceBoxId}
                      resourceBoxPurpose="music_achievement"
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6} md={3} container direction="column">
                  <Grid item>
                    <Typography align="center">
                      {t("music:scoreRankAchievement.rankS")}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ResourceBox
                      resourceBoxId={musicAchievements[3].resourceBoxId}
                      resourceBoxPurpose="music_achievement"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
        </Container>
      )}
      <Typography variant="h6" className={layoutClasses.header}>
        {t("music:difficulty", {
          count:
            musicDiffis &&
            musicDiffis.filter((elem) => elem.musicId === Number(musicId))
              .length,
        })}
      </Typography>
      {musicDiffis && musicAchievements && (
        <Container className={layoutClasses.content} maxWidth="md">
          <Alert severity="info">
            <Trans i18nKey="music:chartCredit" />
          </Alert>
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
                            releaseCondId={elem.releaseConditionId}
                            originalProps={{ align: "right" }}
                            translatedProps={{ align: "right" }}
                          />
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
                        <Grid item xs={2}>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 600 }}
                          >
                            {t("music:comboRewards")}
                          </Typography>
                        </Grid>
                        <Grid item xs={9} container spacing={1}>
                          {musicAchievements
                            .filter(
                              (ma) =>
                                ma.musicDifficultyType === elem.musicDifficulty
                            )
                            .map((achieve) => (
                              <Grid
                                key={achieve.id}
                                item
                                xs={6}
                                md={3}
                                container
                                direction="column"
                              >
                                <Grid item>
                                  <Typography align="center">
                                    {Math.floor(
                                      elem.noteCount *
                                        Number(
                                          achieve.musicAchievementTypeValue
                                        )
                                    )}
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <ResourceBox
                                    resourceBoxId={achieve.resourceBoxId}
                                    resourceBoxPurpose="music_achievement"
                                  />
                                </Grid>
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
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 600 }}
                          >
                            {t("music:chartImage")}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <Link
                                href={`${
                                  window.isChinaMainland
                                    ? process.env.REACT_APP_ASSET_DOMAIN_CN
                                    : `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets`
                                }/music/charts/${musicId.padStart(4, "0")}/${
                                  elem.musicDifficulty
                                }.svg`}
                                target="_blank"
                              >
                                <Grid container justify="flex-end">
                                  <Grid item>
                                    <Typography>SVG</Typography>
                                  </Grid>
                                  <Grid item>
                                    <OpenInNew />
                                  </Grid>
                                </Grid>
                              </Link>
                            </Grid>
                            <Grid item>
                              <Link
                                href={`${
                                  window.isChinaMainland
                                    ? process.env.REACT_APP_ASSET_DOMAIN_CN
                                    : `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets`
                                }/music/charts/${musicId.padStart(4, "0")}/${
                                  elem.musicDifficulty
                                }.png`}
                                target="_blank"
                              >
                                <Grid container justify="flex-end">
                                  <Grid item>
                                    <Typography>PNG</Typography>
                                  </Grid>
                                  <Grid item>
                                    <OpenInNew />
                                  </Grid>
                                </Grid>
                              </Link>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Divider style={{ margin: "1% 0" }} />
                  </Grid>
                </TabPanel>
              ))}
          </TabContext>
        </Container>
      )}
      {!!musicCommentId && (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:comment")} <CommentTextMultiple />
          </Typography>
          <Container className={layoutClasses.content} maxWidth="md">
            <Comment contentType="musics" contentId={musicCommentId} />
          </Container>
        </Fragment>
      )}
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            src: musicJacket,
            alt: "music jacket",
            downloadUrl: musicJacket.replace(".webp", ".png"),
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
