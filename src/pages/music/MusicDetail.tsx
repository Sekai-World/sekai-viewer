import {
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Typography,
  Switch,
  Link,
  Box,
  IconButton,
} from "@mui/material";
import { Alert } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { OpenInNew } from "@mui/icons-material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import {
  IMusicAchievement,
  IMusicDanceMembers,
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicTagInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
  IMusicOriginal,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData, useMusicTagName } from "../../utils";
import { charaIcons } from "../../utils/resources";
import { Trans, useTranslation } from "react-i18next";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { useDurationI18n } from "../../utils/i18nDuration";
import MusicVideoPlayer from "../../components/blocks/MusicVideoPlayer";
import {
  ContentTrans,
  ReleaseCondTrans,
} from "../../components/helpers/ContentTrans";
import ResourceBox from "../../components/widgets/ResourceBox";
import AudioPlayer from "./AudioPlayer";
import { Howl } from "howler";
import { saveAs } from "file-saver";
import Image from "mui-image";
import { useStrapi } from "../../utils/apiClient";
import CommentTextMultiple from "~icons/mdi/comment-text-multiple";
import Comment from "../comment/Comment";
import axios from "axios";
import { trimMP3 } from "../../utils/trimMP3";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import { assetUrl } from "../../utils/urls";
import TypographyCaption from "../../components/styled/TypographyCaption";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import PaperContainer from "../../components/styled/PaperContainer";
import GridOut from "../../components/styled/GridOut";
import EmbedVideoPlayer from "../../components/blocks/EmbedVideoPlayer";

const MusicDetail: React.FC<unknown> = observer(() => {
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const {
    settings: { contentTransMode },
    region,
  } = useRootStore();
  const [, humanizeDurationShort] = useDurationI18n();
  // const [trimmedMP3URL, trimFailed, setTrimOptions] = useTrimMP3();
  const getCharaName = useCharaName();
  const getOriginalCharaName = useCharaName("original");
  const musicTagToName = useMusicTagName(contentTransMode);
  const { getMusic } = useStrapi();

  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [musicDiffis] =
    useCachedData<IMusicDifficultyInfo>("musicDifficulties");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");
  // const [gameCharas] = useCachedData<IGameChara>('gameCharacters');
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");
  // const [releaseConds] = useCachedData<IReleaseCondition>("releaseConditions");
  const [danceMembers] = useCachedData<IMusicDanceMembers>("musicDanceMembers");
  const [musicAchievements] =
    useCachedData<IMusicAchievement>("musicAchievements");
  const [musicOriginals] = useCachedData<IMusicOriginal>("musicOriginals");

  const { musicId } = useParams<{ musicId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [music, setMusic] = useState<IMusicInfo>();
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo[]>([]);
  const [musicVocalTypes, setMusicVocalTypes] = useState<string[]>([]);
  const [musicDanceMember, setMusicDanceMember] =
    useState<IMusicDanceMembers>();
  const [musicOriginal, setMusicOriginal] = useState<IMusicOriginal>();
  const [selectedPreviewVocalType, setSelectedPreviewVocalType] =
    useState<number>(0);
  const [selectedVocalType, setSelectedVocalType] = useState<number>(0);
  const [vocalPreviewVal, setVocalPreviewVal] = useState<string>("1");
  const [vocalDisabled, setVocalDisabled] = useState<boolean>(false);
  const [difficulties, setDifficulties] = useState<IMusicDifficultyInfo[]>([]);
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
    if (music && musicDiffis) {
      setDifficulties(
        musicDiffis.filter((elem) => elem.musicId === Number(musicId))
      );
    }
  }, [music, musicDiffis, musicId]);

  useEffect(() => {
    if (difficulties && difficulties.length) {
      setDiffiInfoTabVal(String(difficulties.length - 1));
    }
  }, [difficulties]);

  useEffect(() => {
    if (musicOriginals) {
      setMusicOriginal(
        musicOriginals.find((elem) => elem.musicId === Number(musicId))
      );
    }
  }, [musicOriginals, musicId]);

  useEffect(() => {
    if (music && musicVocal && musicVocal[selectedPreviewVocalType]) {
      if ([420, 445, 453, 459, 464, 10001, 10002].includes(music.id)) {
        // handle server exclusive music
        getRemoteAssetURL(
          `music/long/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}.${format}`,
          setLongMusicPlaybackURL,
          "minio",
          region
        );
        getRemoteAssetURL(
          `music/short/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}_short.${format}`,
          setShortMusicPlaybackURL,
          "minio",
          region
        );
      } else {
        getRemoteAssetURL(
          `music/long/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}.${format}`,
          setLongMusicPlaybackURL,
          "minio"
        );
        getRemoteAssetURL(
          `music/short/${musicVocal[selectedPreviewVocalType].assetbundleName}_rip/${musicVocal[selectedPreviewVocalType].assetbundleName}_short.${format}`,
          setShortMusicPlaybackURL,
          "minio"
        );
      }
    }
  }, [format, music, musicVocal, region, selectedPreviewVocalType]);

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

  const getVocalCharaIcons: (index: number) => JSX.Element = useCallback(
    (index: number) => {
      return (
        <Grid container columnSpacing={1} alignItems="center">
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
        getRemoteAssetURL(
          `music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}_org.webp`,
          setMusicJacket,
          "minio",
          region
        );
      } else {
        getRemoteAssetURL(
          `music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
          setMusicJacket,
          "minio",
          region
        );
      }
    }
  }, [music, musicVocalTypes, region, selectedPreviewVocalType]);

  const getCharaIcon: (characterId: number, height?: number) => JSX.Element =
    useCallback((characterId, height = 42) => {
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
        album: musicVocal[selectedPreviewVocalType].caption,
        artist: music?.composer,
        artwork: [
          {
            sizes: "740x740",
            src: musicJacket,
            type: "image/webp",
          },
        ],
        title: music?.title,
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
          delimiter: " ",
          maxDecimalPoints: 1,
          spacer: "",
          units: ["s"],
        })} (${humanizeDurationShort(durationMsec, {
          delimiter: " ",
          maxDecimalPoints: 1,
          spacer: "",
          units: ["m", "s"],
        })})`
      );
    },
    [actualPlaybackTime, humanizeDurationShort, music]
  );

  const onSave = useCallback(
    async (src: string) => {
      if (!music) return;
      // console.log(src);
      const vocals = musicVocal[selectedPreviewVocalType].characters.map(
        (chara) =>
          chara.characterType === "game_character"
            ? getOriginalCharaName(chara.characterId)
            : outCharas && outCharas.length
            ? outCharas.find((elem) => elem.id === chara.characterId)!.name
            : chara.characterId
      );
      if (trimSilence && format === "mp3" && vocalPreviewVal === "1") {
        // only trim when downloading full version
        const buf = (await axios.get(src, { responseType: "arraybuffer" }))
          .data as ArrayBuffer;
        const trimmed = trimMP3(buf, music.fillerSec);
        if (trimmed)
          saveAs(
            new Blob([trimmed], {
              type: "audio/mp3",
            }),
            `${music.title}-${
              vocalPreviewVal === "1" ? "full" : "preview"
            }-${vocals.join("+")}.${format}`
          );
      } else {
        saveAs(
          src,
          `${music.title}-${
            vocalPreviewVal === "1" ? "full" : "preview"
          }-${vocals.join("+")}.${format}`
        );
      }
    },
    [
      format,
      getOriginalCharaName,
      music,
      musicVocal,
      outCharas,
      selectedPreviewVocalType,
      trimSilence,
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
          justifyContent="space-between"
        >
          <Grid item xs={12} md={2}>
            <TypographyCaption>{t("music:vocal")}</TypographyCaption>
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
                    disableTypography
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      );
    },
    [t, vocalDisabled, musicVocalTypes, getVocalCharaIcons]
  );

  return music && musicVocals && musicVocals.length ? (
    <Fragment>
      <TypographyHeader>
        {getTranslated(`music_titles:${musicId}`, music.title)}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        {["original", "mv_2d"].includes(vocalPreviewVal) &&
        musicVocalTypes.length &&
        musicVocal.length &&
        longMusicPlaybackURL ? (
          <MusicVideoPlayer
            audioPath={longMusicPlaybackURL}
            videoPath={musicVideoURL}
            onPlay={() => setVocalDisabled(true)}
            onPause={() => setVocalDisabled(false)}
            onEnded={() => setVocalDisabled(false)}
          />
        ) : ["original_video"].includes(vocalPreviewVal) &&
          musicOriginal?.videoLink ? (
          <EmbedVideoPlayer videoUrl={musicOriginal.videoLink} />
        ) : (
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={6}>
              <div
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
              >
                <Box
                  component={Image}
                  src={musicJacket}
                  bgColor=""
                  sx={{ cursor: "pointer" }}
                />
              </div>
            </Grid>
          </Grid>
        )}
        <PaperContainer>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={12} md={2}>
                <TypographyCaption>{t("common:type")}</TypographyCaption>
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
                    label={t("music:vocalTab.title[0]") as string}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="1"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:vocalTab.title[1]") as string}
                    labelPlacement="end"
                  />
                  {music.categories
                    .filter((cat) =>
                      ["original", "mv_2d"].includes(
                        typeof cat === "string" ? cat : cat.musicCategoryName
                      )
                    )
                    .map((cat) => (
                      <FormControlLabel
                        value={cat}
                        control={<Radio color="primary"></Radio>}
                        label={
                          t(
                            `music:categoryType.${
                              typeof cat === "string"
                                ? cat
                                : cat.musicCategoryName
                            }`
                          ) as string
                        }
                        labelPlacement="end"
                        key={
                          typeof cat === "string" ? cat : cat.musicCategoryName
                        }
                      />
                    ))}
                  {!!musicOriginal && (
                    <FormControlLabel
                      value="original_video"
                      control={<Radio color="primary"></Radio>}
                      label={t("music:vocalTab.original_video") as string}
                      labelPlacement="end"
                    />
                  )}
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
              justifyContent="space-between"
            >
              <Grid item xs={12} md={2}>
                <TypographyCaption>
                  {t("music:fileFormat.caption")}
                </TypographyCaption>
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
                    label={t("music:fileFormat.mp3") as string}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value="flac"
                    control={<Radio color="primary"></Radio>}
                    label={t("music:fileFormat.flac") as string}
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
                justifyContent="space-between"
              >
                <Grid item xs={12} md={2}>
                  <TypographyCaption>
                    {t("music:skipBeginningSilence")}
                  </TypographyCaption>
                </Grid>
                <Grid item container xs={12} md={9} spacing={1}>
                  <Switch
                    checked={trimSilence}
                    onChange={() => setTrimSilence((v) => !v)}
                    // disabled={trimFailed || trimLoading}
                  />
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </PaperContainer>
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
        <GridOut container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("music:category", { count: music.categories.length })}
            </Typography>
            <Grid item>
              {music.categories.map((elem) => {
                const cat =
                  typeof elem === "string" ? elem : elem.musicCategoryName;
                return (
                  <Typography align="right" key={`music-cat-${cat}`}>
                    {t(`music:categoryType.${cat}`)}
                  </Typography>
                );
              })}
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
                justifyContent="space-between"
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
            justifyContent="space-between"
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
          {!!musicOriginal && (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {t("music:vocalTab.original_video")}
                </Typography>
                <Typography>
                  <IconButton
                    component="a"
                    href={musicOriginal.videoLink}
                    target="_blank"
                    size="small"
                    color="inherit"
                  >
                    <OpenInNew />
                  </IconButton>
                </Typography>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
        </GridOut>
      </ContainerContent>
      <TypographyHeader>
        {t("music:vocal", { count: musicVocal.length })}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <PaperContainer>
          <Grid container direction="column" spacing={1}>
            <VocalTypeSelector
              vocalType={selectedVocalType}
              onSelect={(v) => setSelectedVocalType(v)}
            />
          </Grid>
        </PaperContainer>
        {musicVocal.length && musicVocal[selectedVocalType] ? (
          <GridOut container direction="column">
            <Grid
              item
              container
              direction="row"
              justifyContent="space-between"
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
                justifyContent="space-between"
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
                      selectedVocalType === 0
                        ? music.releaseConditionId
                        : musicVocal[selectedVocalType].releaseConditionId
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
                justifyContent="space-between"
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
                    original={musicVocal[selectedVocalType].caption}
                    originalProps={{ align: "right" }}
                    translatedProps={{ align: "right" }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </GridOut>
        ) : null}
      </ContainerContent>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
      <TypographyHeader>{t("music:achievement")}</TypographyHeader>
      {musicAchievements && !!musicAchievements.length && (
        <ContainerContent maxWidth="md">
          <Grid container direction="column">
            <Grid
              item
              container
              justifyContent="space-between"
              alignItems="center"
            >
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
                      justifyContent="center"
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
                      justifyContent="center"
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
                      justifyContent="center"
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
                      justifyContent="center"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
        </ContainerContent>
      )}
      <TypographyHeader>
        {t("music:difficulty", {
          count: difficulties.length,
        })}
      </TypographyHeader>
      {difficulties.length && musicAchievements && (
        <ContainerContent maxWidth="md">
          <Alert severity="info">
            <Trans i18nKey="music:chartCredit" />
          </Alert>
          <TabContext value={diffiInfoTabVal}>
            <PaperContainer>
              <Tabs
                value={diffiInfoTabVal}
                onChange={(e, v) => {
                  setDiffiInfoTabVal(v);
                }}
                variant="scrollable"
                scrollButtons
              >
                {difficulties.map((elem, idx) => (
                  <Tab
                    key={`diffi-info-tab-${idx}`}
                    label={elem.musicDifficulty}
                    value={String(idx)}
                  ></Tab>
                ))}
              </Tabs>
            </PaperContainer>
            {difficulties.map((elem, idx) => (
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
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("common:level")}
                    </Typography>
                    <Grid item>{elem.playLevel}</Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid
                    item
                    container
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("music:noteCount")}
                    </Typography>
                    <Grid item>{elem.noteCount || elem.totalNoteCount}</Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
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
                      justifyContent="space-between"
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
                                    (elem.noteCount || elem.totalNoteCount)! *
                                      Number(achieve.musicAchievementTypeValue)
                                  )}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <ResourceBox
                                  resourceBoxId={achieve.resourceBoxId}
                                  resourceBoxPurpose="music_achievement"
                                  justifyContent="center"
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
                      justifyContent="space-between"
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
                                assetUrl.minio.musicChart
                              }/${musicId.padStart(4, "0")}/${
                                elem.musicDifficulty
                              }.svg`}
                              target="_blank"
                              underline="hover"
                            >
                              <Grid container justifyContent="flex-end">
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
                                assetUrl.minio.musicChart
                              }/${musicId.padStart(4, "0")}/${
                                elem.musicDifficulty
                              }.png`}
                              target="_blank"
                              underline="hover"
                            >
                              <Grid container justifyContent="flex-end">
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
        </ContainerContent>
      )}
      {!!musicCommentId && (
        <Fragment>
          <TypographyHeader>
            {t("common:comment")} <CommentTextMultiple />
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <Comment contentType="musics" contentId={musicCommentId} />
          </ContainerContent>
        </Fragment>
      )}
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            alt: "music jacket",
            downloadUrl: musicJacket.replace(".webp", ".png"),
            src: musicJacket,
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
});

export default MusicDetail;
