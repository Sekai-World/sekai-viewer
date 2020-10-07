import {
  Box,
  CardMedia,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Tooltip,
} from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import AudioPlayer from "material-ui-audio-player";
import { IMusicInfo, IMusicVocalInfo } from "../types";
import { useCharas, useMusics, useMusicVocals, useOutCharas } from "../utils";
import { Alert, TabContext, TabPanel } from "@material-ui/lab";
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
    paddingTop: "56.25%",
    backgroundSize: "contain",
    cursor: "pointer",
    margin: theme.spacing(1, 0),
  },
  tabpanel: {
    padding: 0,
  },
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

const MsuicDetail: React.FC<{}> = () => {
  const classes = useStyles();

  const [musics] = useMusics();
  const [musicVocals] = useMusicVocals();
  const [gameCharas] = useCharas();
  const [outCharas] = useOutCharas();

  const { musicId } = useParams<{ musicId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [music, setMusic] = useState<IMusicInfo>();
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo[]>([]);
  const [musicVocalTypes, setMusicVocalTypes] = useState<string[]>([]);
  const [selectedVocalType, setSelectedVocalType] = useState<number>(0);
  const [vocalTabVal, setVocalTabVal] = useState<string>("0");
  const [vocalDisabled, setVocalDisabled] = useState<boolean>(false);

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
    if (music) {
      document.title = `${music.title} | Music | Sekai Viewer`;
    }
  }, [music]);

  // useEffect(() => {
  //   if (musicVocalTypes.length) {
  //     console.log(musicVocalTypes)
  //     setSelectedVocalType(musicVocalTypes[0])
  //   }
  // }, [musicVocalTypes])

  function getVocalCharaNames(index: number): React.ReactElement {
    return gameCharas.length && outCharas.length ? (
      <Fragment>
        {musicVocal[index].characters.map((chara) => {
          switch (chara.characterType) {
            case "game_character":
              const gc = gameCharas.find((gc) => gc.id === chara.characterId)!;
              return gc.firstName ? (
                <p
                  key={chara.characterId}
                >{`${gc.firstName} ${gc.givenName}`}</p>
              ) : (
                <p key={chara.characterId}>{gc.givenName}</p>
              );
            case "outside_character":
              return (
                <p key={chara.characterId}>
                  {outCharas.find((oc) => oc.id === chara.characterId)!.name}
                </p>
              );
          }
          return null;
        })}
      </Fragment>
    ) : (
      <Fragment></Fragment>
    );
  }

  return music ? (
    <Fragment>
      <Alert severity="warning">
        The first <b>nine seconds</b> of every music have no sound. That's NOT a
        bug.
      </Alert>
      <CardMedia
        onClick={() => {
          setActiveIdx(0);
          setVisible(true);
        }}
        classes={{ root: classes["media-contain"] }}
        image={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`}
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
            <Tab label="Pure Music" value="0"></Tab>
            {music.categories.includes("original") ||
            music.categories.includes("mv_2d") ? (
              <Tab label="Music Video" value="1"></Tab>
            ) : null}
          </Tabs>
          <TabPanel value="0">
            {musicVocalTypes.length && musicVocal.length ? (
              <Fragment>
                <FormControl>
                  <FormLabel>Vocal Type</FormLabel>
                  <RadioGroup
                    row
                    aria-label="vocal type"
                    name="vocal-type"
                    defaultValue="0"
                    onChange={(e, v) => setSelectedVocalType(Number(v))}
                  >
                    {musicVocalTypes.map((elem, idx) => (
                      <Tooltip
                        key={`vocal-tooltip-${idx}`}
                        title={<div>{getVocalCharaNames(idx)}</div>}
                        placement="top"
                      >
                        <FormControlLabel
                          key={`vocal-type-${idx}`}
                          value={String(idx)}
                          control={<Radio color="primary"></Radio>}
                          label={elem}
                          labelPlacement="end"
                        />
                      </Tooltip>
                    ))}
                  </RadioGroup>
                </FormControl>
                <AudioPlayer
                  variation="primary"
                  download
                  src={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`}
                ></AudioPlayer>
              </Fragment>
            ) : null}
          </TabPanel>
          <TabPanel value="1">
            {musicVocalTypes.length && musicVocal.length ? (
              <Box>
                <FormControl disabled={vocalDisabled}>
                  <FormLabel>Vocal Type</FormLabel>
                  <RadioGroup
                    row
                    aria-label="vocal type"
                    name="vocal-type"
                    defaultValue="0"
                    onChange={(e, v) => setSelectedVocalType(Number(v))}
                  >
                    {musicVocalTypes.map((elem, idx) => (
                      <Tooltip
                        key={`vocal-tooltip-${idx}`}
                        title={<div>{getVocalCharaNames(idx)}</div>}
                        placement="top"
                      >
                        <FormControlLabel
                          key={`vocal-type-${idx}`}
                          value={String(idx)}
                          control={<Radio color="primary"></Radio>}
                          label={elem}
                          labelPlacement="end"
                        />
                      </Tooltip>
                    ))}
                  </RadioGroup>
                </FormControl>
                <MusicVideoPlayer
                  audioPath={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`}
                  videoPath={`https://sekai-res.dnaroma.eu/file/sekai-assets/live/2dmode/${
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

      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            src: `https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
            alt: "music jacket",
            downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/music/jacket/${music.assetbundleName}_rip/${music.assetbundleName}.webp`,
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
    <div>Music {musicId} not found.</div>
  );
};

export default MsuicDetail;
