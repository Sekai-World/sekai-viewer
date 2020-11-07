import {
  Container,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { SettingContext } from "../context";
import { useLayoutStyles } from "../styles/layout";
import { IGameChara, IMusicInfo, IMusicTagInfo, IUnitProfile } from "../types";
import { useCachedData, useCharaName } from "../utils";
import { useAssetI18n } from "../utils/i18n";
import { charaIcons, UnitLogoMap } from "../utils/resources";
import ColorPreview from "./subs/ColorPreview";
import { CharaNameTrans, ContentTrans } from "./subs/ContentTrans";

const useStyle = makeStyles((theme) => ({
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  media: {
    paddingTop: "70%",
    cursor: "pointer",
  },
  nameLabel: {
    paddingTop: "30%",
    backgroundSize: "contain",
  },
  nameVerticalLabel: {
    paddingTop: "45%",
    backgroundSize: "contain",
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
  "unit-logo-img": {
    maxWidth: "128px",
  },
}));

const unitIdTagMap: { [key: string]: string } = {
  light_sound: "light_music_club",
  piapro: "vocaloid",
};

const UnitDetail: React.FC<{}> = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");
  const [musics] = useCachedData<IMusicInfo>("musics");
  const [musicTags] = useCachedData<IMusicTagInfo>("musicTags");

  const [unit, setUnit] = useState<IUnitProfile>();
  const [unitCharas, setUnitCharas] = useState<IGameChara[]>([]);
  const [unitMusics, setUnitMusics] = useState<IMusicInfo[]>([]);

  useEffect(() => {
    document.title = t("title:unitDetail", { name: unit?.unitName });
  }, [t, unit]);

  useEffect(() => {
    if (
      unitProfiles.length &&
      gameCharas.length &&
      musics.length &&
      musicTags.length
    ) {
      setUnit(unitProfiles.find((up) => up.unit === unitId));
      setUnitCharas(gameCharas.filter((gc) => gc.unit === unitId));
      const unitMusicIds = musicTags
        .filter(
          (mt) =>
            mt.musicTag ===
            (Object.prototype.hasOwnProperty.call(unitIdTagMap, unitId)
              ? unitIdTagMap[unitId]
              : unitId)
        )
        .map((mt) => mt.musicId);
      setUnitMusics(musics.filter((m) => unitMusicIds.includes(m.id)));
    }
  }, [unitProfiles, unitId, gameCharas, musics, musicTags]);

  return unit ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getTranslated(
          contentTransMode,
          `unit_profile:${unit.unit}.name`,
          unit.unitName
        )}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <div style={{ textAlign: "center" }}>
          <img
            src={UnitLogoMap[unit.unit]}
            alt={unit.unitName}
            style={{ maxWidth: "100%" }}
          ></img>
        </div>
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:id")}
            </Typography>
            <Typography>{unit.seq}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("unit:introduction")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={8}>
              <Grid container justify="flex-end">
                <ContentTrans
                  mode={contentTransMode}
                  contentKey={`unit_profile:${unit.unit}.profileSentence`}
                  original={unit.profileSentence}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("unit:colorCode")}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <Typography>{unit.colorCode}</Typography>
                </Grid>
                <Grid item>
                  <ColorPreview colorCode={unit.colorCode} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:character", {
          count: unitCharas.length,
        })}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid
          className={classes["grid-out"]}
          container
          direction="row"
          spacing={2}
          justify="center"
        >
          {unitCharas.map((uc) => (
            <Fragment key={`chara-${uc.id}`}>
              <Grid item xs={6} md={4} lg={3}>
                <Link to={"/chara/" + uc.id} style={{ textDecoration: "none" }}>
                  <Paper>
                    <Grid container direction="column" alignItems="center">
                      <Grid item>
                        <Grid container justify="flex-end">
                          <img
                            key={uc.id}
                            height="84"
                            src={charaIcons[`CharaIcon${uc.id}`]}
                            alt={getCharaName(uc.id)}
                          ></img>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <CharaNameTrans
                          mode={contentTransMode}
                          characterId={uc.id}
                          originalProps={{
                            variant: "subtitle1",
                            style: { fontWeight: 600 },
                          }}
                          translatedProps={{
                            variant: "subtitle2",
                            align: "center",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Link>
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:music")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid
          className={classes["grid-out"]}
          container
          direction="row"
          spacing={2}
          justify="center"
        >
          {unitMusics.map((um) => (
            <Fragment key={`music-${um.id}`}>
              <Grid item xs={6} md={3} lg={2}>
                <Link to={"/music/" + um.id} style={{ textDecoration: "none" }}>
                  <Paper>
                    <Grid
                      container
                      direction="column"
                      alignItems="center"
                      spacing={1}
                    >
                      <Grid item>
                        <Grid container justify="flex-end">
                          <img
                            key={um.id}
                            src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/music/jacket/${um.assetbundleName}_rip/${um.assetbundleName}.webp`}
                            alt={um.title}
                            style={{ maxWidth: "100%" }}
                          ></img>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <ContentTrans
                          mode={contentTransMode}
                          contentKey={`music_titles:${um.id}`}
                          original={um.title}
                          originalProps={{
                            variant: "subtitle1",
                            style: { fontWeight: 600 },
                            align: "center",
                          }}
                          translatedProps={{
                            variant: "subtitle2",
                            align: "center",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Link>
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </Container>
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, unit {unitId} does not exist.
    </div>
  );
};

export default UnitDetail;
