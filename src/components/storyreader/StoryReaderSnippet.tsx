import {
  Avatar,
  Card,
  Chip,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { PlayArrow, Stop } from "@material-ui/icons";
import React, { useCallback, useState } from "react";
import { BufferLoader } from "../../utils/bufferLoader";
import { charaIcons } from "../../utils/resources";

const useStyle = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(1.5, 0),
    padding: theme.spacing(1.5, 0),
  },
}));

const audioContext = new AudioContext();

export const Talk: React.FC<{
  characterId: number;
  characterName: string;
  text: string;
  voiceUrl: string;
}> = ({ characterId, characterName, text, voiceUrl }) => {
  const classes = useStyle();

  const [isPlay, setIsPlay] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode>();

  const PlayAudio = useCallback(() => {
    if (!isPlay) {
      if (audioSource) {
        audioSource.stop();
      }
      const buf = new BufferLoader(audioContext, [voiceUrl], () => {
        const source = audioContext.createBufferSource();
        source.buffer = buf.bufferList[0];
        const gain = audioContext.createGain();
        gain.gain.value = 0.5;
        source.connect(gain);
        gain.connect(audioContext.destination);
        source.start(audioContext.currentTime);
        // workaround??
        // source.stop();
        // source.start(audioContext.currentTime);
        setAudioSource(source);

        source.addEventListener("ended", () => {
          setAudioSource(undefined);
          setIsPlay(false);
        });
        setIsPlay(true);
      });
      buf.load();
    } else {
      if (audioSource) {
        audioSource.stop();
        setAudioSource(undefined);
      }
      setIsPlay(false);
    }
  }, [voiceUrl, audioSource, isPlay]);

  return (
    <Card className={classes.card}>
      <Grid container alignItems="center">
        <Grid item xs={3} md={2}>
          <Grid container justify="center">
            <Avatar
              src={charaIcons[`CharaIcon${characterId}` as "CharaIcon1"]}
            />
          </Grid>
        </Grid>
        <Grid item xs={8} md={9}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Chip label={characterName} />
            </Grid>
            <Grid item xs={12}>
              <Typography>{text}</Typography>
            </Grid>
          </Grid>
        </Grid>
        {voiceUrl ? (
          <Grid item xs={1}>
            <IconButton onClick={PlayAudio}>
              {isPlay ? <Stop /> : <PlayArrow />}
            </IconButton>
          </Grid>
        ) : null}
      </Grid>
    </Card>
  );
};
