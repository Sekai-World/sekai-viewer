import {
  Container,
  Grid,
  IconButton,
  Link,
  Paper,
  Slider,
} from "@material-ui/core";
import {
  CloudDownload,
  // Loop,
  Pause,
  PlayArrow,
  VolumeOff,
  VolumeUp,
} from "@material-ui/icons";
import { Howl } from "howler";
import React, { useCallback, useEffect, useState } from "react";

const AudioPlayer: React.FC<{
  src: string;
  onPlay?: (howl: Howl) => void;
  onLoad?: (howl: Howl) => void;
  onSave?: (src: string) => void;
}> = ({ src, onPlay, onLoad, onSave }) => {
  const [sound, setSound] = useState<Howl>();
  const [playbackTime, setPlaybackTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  // const [isLoop, setIsLoop] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    console.log(src);
    const _sound = new Howl({
      src: [src],
      html5: true,
      format: ["mp3"],
      volume: 1,
    });
    _sound.on("load", () => {
      setTotalTime(_sound.duration());
      if (onLoad) onLoad(_sound);
    });
    _sound.on("play", () => {
      if (onPlay) onPlay(_sound);
      requestAnimationFrame(function update() {
        const currentTime = _sound.seek() as number;
        setPlaybackTime(currentTime);

        if (_sound.playing()) requestAnimationFrame(update);
      });
    });
    _sound.on("stop", () => {
      setPlaybackTime(0);
      setIsPlay(false);
    });
    _sound.on("end", () => {
      setPlaybackTime(0);
      setIsPlay(false);
    });
    setSound(_sound);
    return () => {
      _sound.stop();
      // _sound.unload();
    };
  }, [onLoad, onPlay, src]);

  const seekHandler = useCallback(
    (_, v: number | number[]) => {
      if (sound) {
        sound.seek(v as number);
        setPlaybackTime(v as number);
      }
    },
    [sound]
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
    <Paper>
      <Container>
        <Grid container justify="space-between" alignItems="center">
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
        <Grid container justify="space-between" alignItems="center">
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
            <IconButton
              onClick={() => {
                if (onSave) onSave(src);
              }}
            >
              {!onSave ? (
                <Link href={src} target="_blank">
                  <CloudDownload />
                </Link>
              ) : (
                <CloudDownload />
              )}
            </IconButton>
          </Grid>
          <Grid item xs={2} md={1}>
            <IconButton
              onClick={() => {
                setIsPlay(!isPlay);
                if (!isPlay) sound?.play();
                else sound?.pause();
              }}
            >
              {isPlay ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
            container
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <IconButton
                onClick={() => {
                  setIsMute(!isMute);
                  sound?.mute(!isMute);
                }}
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
