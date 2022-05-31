import { Typography, Grid, Paper, Box, Chip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import {
  IMusicDifficultyInfo,
  IMusicInfo,
  IMusicVocalInfo,
  IOutCharaProfile,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";
import Image from "mui-image";
import { charaIcons } from "../../utils/resources";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    // "white-space": "nowrap",
    // overflow: "hidden",
    // "text-overflow": "ellipsis",
  },
  agendaWrapper: {
    display: "block",
    // [theme.breakpoints.down("sm")]: {
    //   maxWidth: "300px",
    // },
    // [theme.breakpoints.only("md")]: {
    //   maxWidth: "600px",
    // },
    // maxWidth: "70%",
    margin: "auto",
    cursor: "pointer",
  },
  agenda: {
    padding: "0.3rem 0.5rem",
  },
  "diffi-easy": {
    backgroundColor: "#66DD11",
  },
  "diffi-normal": {
    backgroundColor: "#33BBEE",
  },
  "diffi-hard": {
    backgroundColor: "#FFAA00",
  },
  "diffi-expert": {
    backgroundColor: "#EE4466",
  },
  "diffi-master": {
    backgroundColor: "#BB33EE",
  },
}));

const AgendaView: React.FC<{ data?: IMusicInfo }> = observer(({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { region } = useRootStore();

  const [musicDiffis] =
    useCachedData<IMusicDifficultyInfo>("musicDifficulties");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");
  const [outCharas] = useCachedData<IOutCharaProfile>("outsideCharacters");

  const [jacket, setJacket] = useState<string>("");
  const [diffis, setDiffis] = useState<IMusicDifficultyInfo[]>([]);
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo[]>([]);

  useEffect(() => {
    if (data)
      getRemoteAssetURL(
        `music/jacket/${data.assetbundleName}_rip/${data.assetbundleName}.webp`,
        setJacket,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
  }, [data, region]);

  useEffect(() => {
    if (data && musicDiffis && musicDiffis.length) {
      setDiffis(musicDiffis.filter((elem) => elem.musicId === data.id));
    }
  }, [musicDiffis, data]);

  useEffect(() => {
    if (data && musicVocals && musicVocals.length) {
      setMusicVocal(
        musicVocals.filter((elem) => elem.musicId === Number(data.id))
      );
    }
  }, [musicVocals, data]);

  const getVocalCharaIcons: (index: number) => JSX.Element = useCallback(
    (index: number) => {
      return (
        <Grid container alignItems="center">
          {musicVocal[index].characters.map((chara) =>
            chara.characterType === "game_character" ? (
              <Grid
                item
                key={`chara-${chara.characterId}`}
                style={{ marginLeft: "0.1em", marginRight: "0.1em" }}
              >
                <img
                  key={chara.characterId}
                  height="36"
                  src={charaIcons[`CharaIcon${chara.characterId}`]}
                  alt={`character ${chara.characterId}`}
                ></img>
              </Grid>
            ) : (
              <Grid
                item
                key={`outchara-${chara.characterId}`}
                style={{ marginLeft: "0.1em", marginRight: "0.1em" }}
              >
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

  if (!data) {
    // loading
    return (
      <Box className={classes.agendaWrapper}>
        <Paper className={classes.agenda}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={3} sm={2} md={1}>
              <Skeleton
                variant="rectangular"
                width="96px"
                height="96px"
              ></Skeleton>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="body1">
                <Skeleton variant="text" width="60%"></Skeleton>
              </Typography>
            </Grid>
            <Grid item xs={4} sm={3}>
              <Typography variant="body1">
                <Skeleton variant="text" width="60%"></Skeleton>
              </Typography>
            </Grid>
            <Grid item xs={3} sm={2}>
              <Typography variant="body1">
                <Skeleton variant="text" width="60%"></Skeleton>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  return (
    <Link
      to={path + "/" + data.id}
      className={classes.agendaWrapper}
      style={{ textDecoration: "none" }}
    >
      <Paper className={classes.agenda}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={3} sm={2} md={1}>
            <Image
              src={jacket}
              alt={getTranslated(`music_titles:${data.id}`, data.title)}
              // aspectRatio={1}
              bgColor=""
            ></Image>
          </Grid>
          <Grid item xs={9} sm={2}>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <SpoilerTag releaseTime={new Date(data.publishedAt)} />
              </Grid>
              <Grid item>
                <ContentTrans
                  contentKey={`music_titles:${data.id}`}
                  original={data.title}
                  originalProps={{
                    variant: "subtitle1",
                    className: classes.header,
                  }}
                  translatedProps={{
                    variant: "subtitle1",
                    className: classes.header,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={3} md={4}>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                {diffis.map((elem) => (
                  <Grid item xs={2} key={`diff-${elem.id}`}>
                    <Chip
                      color="primary"
                      size="small"
                      classes={{
                        colorPrimary:
                          classes[
                            `diffi-${elem.musicDifficulty}` as
                              | "diffi-easy"
                              | "diffi-normal"
                              | "diffi-hard"
                              | "diffi-expert"
                              | "diffi-master"
                          ],
                      }}
                      label={elem.playLevel}
                    ></Chip>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={2}>
            {data.categories.map((cat) => (
              <Chip label={t(`music:categoryType.${cat}`)} key={cat}></Chip>
            ))}
          </Grid>
          {musicVocal && (
            <Grid item xs={12} sm={3} md={3}>
              <Grid container spacing={2} alignItems="center">
                {musicVocal.map((_, idx) => (
                  <Grid item key={idx}>
                    {getVocalCharaIcons(idx)}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Link>
  );
});

export default AgendaView;
