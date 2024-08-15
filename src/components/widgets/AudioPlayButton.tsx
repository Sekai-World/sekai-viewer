import { Stop, PlayArrow, CloudDownload } from "@mui/icons-material";
import { Grid, CircularProgress, Fab, Link } from "@mui/material";
import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Howl } from "howler";

export const AudioPlayButton: React.FC<{ url: string }> = ({ url }) => {
  const [isPlay, setIsPlay] = useState(false);
  const [audioSource, setAudioSource] = useState<Howl>();
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const PlayAudio = useCallback(() => {
    if (!isPlay) {
      if (audioSource) {
        audioSource.play();
        return;
      }
      setIsAudioLoading(true);
      const audio = new Howl({
        src: [url],
      });
      audio.on("load", () => {
        setIsAudioLoading(false);
        audio.play();
      });
      audio.on("play", () => {
        setIsPlay(true);
      });
      audio.on("end", () => {
        setIsPlay(false);
      });
      setAudioSource(audio);
    } else {
      if (audioSource) {
        audioSource.stop();
      }
      setIsPlay(false);
    }
  }, [url, audioSource, isPlay]);

  useEffect(() => {
    return () => {
      if (audioSource) {
        audioSource.stop();
        audioSource.unload();
      }
    };
  }, [audioSource]);

  return (
    <Grid container spacing={1}>
      <Grid item>
        <Fab onClick={PlayAudio} size="small">
          {isPlay ? (
            <Stop />
          ) : isAudioLoading ? (
            <CircularProgress
              variant="indeterminate"
              size="1rem"
              color="inherit"
            />
          ) : (
            <PlayArrow />
          )}
        </Fab>
      </Grid>
      <Grid item>
        <Fab size="small" component={Link} href={url} download>
          <CloudDownload />
        </Fab>
      </Grid>
    </Grid>
  );
};

export default AudioPlayButton;
