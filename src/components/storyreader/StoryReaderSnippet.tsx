import {
  Avatar,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Fab,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { PlayArrow, Stop } from "@material-ui/icons";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Howl } from "howler";
import { charaIcons } from "../../utils/resources";
import { useEffect } from "react";

const useStyle = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(1.5, 0),
    padding: theme.spacing(1.5, 0),
  },
}));

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
    <Fab onClick={PlayAudio} size="small">
      {isPlay ? (
        <Stop />
      ) : isAudioLoading ? (
        <CircularProgress variant="indeterminate" size="1rem" color="inherit" />
      ) : (
        <PlayArrow />
      )}
    </Fab>
  );
};

export const Talk: React.FC<{
  characterId: number;
  characterName: string;
  text: string;
  voiceUrl: string;
}> = ({ characterId, characterName, text, voiceUrl }) => {
  const classes = useStyle();

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
        <Grid item xs={7} md={9}>
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
            <AudioPlayButton url={voiceUrl} />
          </Grid>
        ) : null}
      </Grid>
    </Card>
  );
};

export const SpecialEffect: React.FC<{
  seType: string;
  text: string;
  resource: string;
}> = ({ seType, text, resource }) => {
  const classes = useStyle();
  const { t } = useTranslation();

  const [isBGOpen, setIsBGOpen] = useState(false);
  const [isMovieOpen, setIsMovieOpen] = useState(false);

  switch (seType) {
    case "FullScreenText":
      return (
        <Card className={classes.card}>
          <Grid container alignItems="center">
            <Grid item xs={3} md={2}></Grid>
            <Grid item xs={7} md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Chip label={t("story_reader:snippet.FullScreenText")} />
                </Grid>
                <Grid item xs={12}>
                  <Typography>{text.trimStart()}</Typography>
                </Grid>
              </Grid>
            </Grid>
            {resource ? (
              <Grid item xs={1}>
                <AudioPlayButton url={resource} />
              </Grid>
            ) : null}
          </Grid>
        </Card>
      );
    case "Telop":
      return (
        <Card className={classes.card}>
          <Grid container alignItems="center">
            <Grid item xs={3} md={2}></Grid>
            <Grid item xs={8} md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Chip label={t("story_reader:snippet.Telop")} />
                </Grid>
                <Grid item xs={12}>
                  <Typography>{text.trimStart()}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      );
    case "ChangeBackground":
      return (
        <Card className={classes.card}>
          <Grid container alignItems="center">
            <Grid item xs={3} md={2}></Grid>
            <Grid item xs={8} md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Chip label={t("story_reader:snippet.ChangeBackground")} />
                </Grid>
                {isBGOpen ? (
                  <Grid item xs={12}>
                    <CardMedia
                      onClick={() => window.open(resource, "_blank")}
                      image={resource}
                      style={{ paddingTop: "56.25%", cursor: "pointer" }}
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => setIsBGOpen(true)}
                    >
                      {t("story_reader:snippet.ShowBackground")}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Card>
      );
    case "Movie":
      return (
        <Card className={classes.card}>
          <Grid container alignItems="center">
            <Grid item xs={3} md={2}></Grid>
            <Grid item xs={8} md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Chip label={t("story_reader:snippet.Movie")} />
                </Grid>
                {isMovieOpen ? (
                  <Grid item xs={12}>
                    <video style={{ maxWidth: "100%" }} controls>
                      <source src={resource}></source>
                    </video>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => setIsMovieOpen(true)}
                    >
                      {t("story_reader:snippet.ShowMovie")}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Card>
      );
    default:
      return null;
  }
};

export const Sound: React.FC<{
  hasBgm: boolean;
  hasSe: boolean;
  voiceUrl: string;
}> = ({ hasBgm, hasSe, voiceUrl }) => {
  const classes = useStyle();
  const { t } = useTranslation();

  return (
    <Card className={classes.card}>
      <Grid container alignItems="center">
        <Grid item xs={3} md={2}></Grid>
        <Grid item xs={7} md={9}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Chip
                label={
                  hasBgm
                    ? t("story_reader:snippet.BGM")
                    : hasSe
                    ? t("story_reader:snippet.SE")
                    : "UNKNOWN"
                }
              />
            </Grid>
            {voiceUrl.endsWith("bgm00000.mp3") ? (
              <Grid item xs={12}>
                <Typography>{t("story_reader:snippet.NoSound")}</Typography>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        {voiceUrl && !voiceUrl.endsWith("bgm00000.mp3") ? (
          <Grid item xs={1}>
            <AudioPlayButton url={voiceUrl} />
          </Grid>
        ) : null}
      </Grid>
    </Card>
  );
};
