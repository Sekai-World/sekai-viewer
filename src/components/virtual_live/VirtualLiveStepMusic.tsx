import { Grid, Typography } from "@material-ui/core";
import React, { Fragment, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useInteractiveStyles } from "../../styles/interactive";
import { IMusicInfo, IMusicVocalInfo, VirtualLiveSetlist } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import AudioPlayer from "../music/AudioPlayer";
import { CharaNameTrans, ContentTrans } from "../subs/ContentTrans";

const VirtualLiveStepMusic: React.FC<{
  data: VirtualLiveSetlist;
}> = ({ data }) => {
  const { t } = useTranslation();
  const interactiveClasses = useInteractiveStyles();

  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicVocals] = useCachedData<IMusicVocalInfo>("musicVocals");

  const [music, setMusic] = useState<IMusicInfo>();
  const [musicVocal, setMusicVocal] = useState<IMusicVocalInfo>();
  const [musicVocalURL, setMusicVocalURL] = useState<string>("");

  useLayoutEffect(() => {
    if (musics) {
      setMusic(musics.find((elem) => elem.id === data.musicId!));
    }
  }, [data.musicId, musics]);

  useLayoutEffect(() => {
    if (musicVocals) {
      setMusicVocal(musicVocals.find((elem) => elem.id === data.musicVocalId!));
    }
  }, [data.musicVocalId, musicVocal, musicVocals]);

  useLayoutEffect(() => {
    if (music && musicVocal) {
      getRemoteAssetURL(
        `music/long/${musicVocal.assetbundleName}_rip/${musicVocal.assetbundleName}.mp3`,
        setMusicVocalURL,
        window.isChinaMainland
      );
    }
  }, [music, musicVocal]);

  return (
    <Fragment>
      {music && musicVocal && (
        <Fragment>
          <Grid
            container
            alignItems="center"
            spacing={1}
            justify="space-around"
          >
            <Grid item>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Typography color="textSecondary">
                    {t("common:title")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Link
                    to={`/music/${music.id}`}
                    className={interactiveClasses.noDecoration}
                  >
                    <ContentTrans
                      contentKey={"music_name:" + music.id}
                      original={music.title}
                    />
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Typography color="textSecondary">
                    {t("music:vocal", { count: musicVocal.characters.length })}
                  </Typography>
                </Grid>
                {musicVocal.characters.map((chara) => (
                  <Grid item key={chara.characterId}>
                    <CharaNameTrans characterId={chara.characterId} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <AudioPlayer src={musicVocalURL} />
            </Grid>
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
};

export default VirtualLiveStepMusic;
