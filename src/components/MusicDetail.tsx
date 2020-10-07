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
  // Tooltip,
} from "@material-ui/core";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import AudioPlayer from "material-ui-audio-player";
import { IMusicInfo, IMusicVocalInfo } from "../types";
import { useMusics, useMusicVocals } from "../utils";
import { Alert, TabContext, TabPanel } from "@material-ui/lab";
import MusicVideoPlayer from "./subs/MusicVideoPlayer";
import { charaIcons } from "../utils/resources";

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
      paddingTop: "40%",
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
    padding: theme.spacing("1%", "2%"),
  },
}));

const MsuicDetail: React.FC<{}> = () => {
  const classes = useStyles();

  const [musics] = useMusics();
  const [musicVocals] = useMusicVocals();
  // const [gameCharas] = useCharas();
  // const [outCharas] = useOutCharas();

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

  const getVocalCharaIcons: (index: number) => JSX.Element = useCallback((index: number) => {
    return (
      <Fragment>
        {musicVocal[index].characters.map((chara) => (
          <img
            key={chara.characterId}
            height="42"
            src={charaIcons[`CharaIcon${chara.characterId}`]}
            alt={`charachter ${chara.characterId}`}
          ></img>
        ))}
      </Fragment>
    );
  }, [musicVocal])

  const VocalTypeSelector: JSX.Element = useMemo(() => {
    return (
        <FormControl disabled={vocalDisabled} style={{marginLeft: "18.5px", marginTop: "1%"}}>
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
                <AudioPlayer
                  variation="primary"
                  download
                  src={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/short/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}_short.mp3`}
                ></AudioPlayer>
              </Fragment>
            ) : null}
          </TabPanel>
          <TabPanel value="1">
            {musicVocalTypes.length && musicVocal.length ? (
              <Fragment>
                <AudioPlayer
                  variation="primary"
                  download
                  src={`https://sekai-res.dnaroma.eu/file/sekai-assets/music/long/${musicVocal[selectedVocalType].assetbundleName}_rip/${musicVocal[selectedVocalType].assetbundleName}.mp3`}
                ></AudioPlayer>
              </Fragment>
            ) : null}
          </TabPanel>
          <TabPanel value="2">
            {musicVocalTypes.length && musicVocal.length ? (
              <Box>
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
