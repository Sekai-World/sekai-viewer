import {
  Container,
  Grid,
  IconButton,
  Link,
  Paper,
  Slider,
  Tooltip,
} from "@mui/material";
import {
  CloudDownload,
  // Loop,
  Pause,
  PlayArrow,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import { Howl } from "howler";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const AudioPlayer: React.FC<{
  src: string;
  onPlay?: (howl: Howl) => void;
  onLoad?: (howl: Howl) => void;
  onSave?: (src: string) => void;
  style?: React.CSSProperties;
  offset?: number;
}> = ({ src, onPlay, onLoad, onSave, style, offset }) => {
  const { t } = useTranslation();

  const [sound, setSound] = useState<Howl>();
  const [playbackTime, setPlaybackTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  // const [isLoop, setIsLoop] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [volume, setVolume] = useState(100);
  const [totalOffset, setTotalOffset] = useState(offset || 0);
  // const [loop, setLoop] = useState(false);

  useEffect(() => {
    // console.log(src);
    const _sound = new Howl({
      src: [src],
      html5: true,
      format: ["mp3"],
      volume: volume / 100,
      // loop: loop,
    });
    _sound.on("load", () => {
      setTotalTime(_sound.duration() - totalOffset);
      setPlaybackTime(0);
      _sound.seek(totalOffset);
      if (onLoad) onLoad(_sound);
    });
    _sound.on("play", () => {
      if (onPlay) onPlay(_sound);
      requestAnimationFrame(function update() {
        if (!_sound.playing()) return;
        const currentTime = _sound.seek() as number;
        setPlaybackTime(currentTime - totalOffset);

        requestAnimationFrame(update);
      });
    });
    _sound.on("stop", () => {
      setPlaybackTime(0);
      _sound.seek(totalOffset);
      setIsPlay(false);
    });
    _sound.on("end", () => {
      setPlaybackTime(0);
      _sound.seek(totalOffset);
      setIsPlay(false);
    });
    setSound(_sound);
    return () => {
      _sound.stop();
      _sound.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoad, onPlay, src, totalOffset]);

  useEffect(() => {
    if (offset !== undefined) setTotalOffset(offset);
  }, [offset]);

  const seekHandler = useCallback(
    (_, v: number | number[]) => {
      if (sound) {
        setPlaybackTime(v as number);
        if (sound.playing()) {
          sound.pause();
          sound.seek(totalOffset + (v as number));
          sound.play();
        } else {
          sound.seek(totalOffset + (v as number));
        }
      }
    },
    [sound, totalOffset]
  );

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time - minutes * 60) || 0;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, []);

  return (
    <Paper style={style}>
      <Container>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={2} md={1}>
            {formatTime(playbackTime)}
          </Grid>
          <Grid item xs={7} md={9}>
            <Slider
              value={playbackTime}
              onChange={seekHandler}
              min={0}
              max={totalTime}
              step={0.1}
            />
          </Grid>
          <Grid item xs={2} md={1}>
            {formatTime(totalTime)}
          </Grid>
        </Grid>
        <Grid container justifyContent="space-between" alignItems="center">
          {/* <Grid item xs={2} md={1}>
            <IconButton
              onClick={() => {
                setIsLoop(!isLoop);
                sound?.loop(!isLoop);
              }}
            >
              <Loop color={isLoop ? "action" : "disabled"} />
            </IconButton>
          </Grid> */}
          <Grid item xs={2} md={1}>
            <Tooltip
              title={
                src.endsWith("flac")
                  ? (t("music:downloadFlacNoTrim") as string)
                  : ""
              }
            >
              <IconButton
                onClick={() => {
                  if (onSave) onSave(src);
                }}
                size="large"
              >
                {!onSave ? (
                  <Link href={src} download underline="hover">
                    <CloudDownload />
                  </Link>
                ) : (
                  <CloudDownload />
                )}
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs={2} md={1}>
            <IconButton
              onClick={() => {
                setIsPlay(!isPlay);
                if (!isPlay) sound?.play();
                else sound?.pause();
              }}
              size="large"
            >
              {isPlay ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <IconButton
                onClick={() => {
                  setIsMute(!isMute);
                  sound?.mute(!isMute);
                }}
                size="large"
              >
                {isMute ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Grid>
            <Grid item xs={7} md={8}>
              <Slider
                value={volume}
                onChange={(_, v) => {
                  setVolume(v as number);
                  sound?.volume((v as number) / 100);
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

export default AudioPlayer;
