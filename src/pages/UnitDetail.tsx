import { Divider, Grid, Paper, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Image from "mui-image";
import {
  IGameChara,
  IMusicInfo,
  IMusicTagInfo,
  IUnitProfile,
} from "../types.d";
import { getRemoteAssetURL, useCachedData } from "../utils";
import { useAssetI18n, useCharaName } from "../utils/i18n";
import { charaIcons, UnitLogoMap } from "../utils/resources";
import ColorPreview from "../components/helpers/ColorPreview";
import {
  CharaNameTrans,
  ContentTrans,
} from "../components/helpers/ContentTrans";
import { OpenInNew } from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../stores/root";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";
import GridOut from "../components/styled/GridOut";
import LinkNoDecoration from "../components/styled/LinkNoDecoration";

const unitIdTagMap: { [key: string]: string } = {
  light_sound: "light_music_club",
  piapro: "vocaloid",
};

const UnitMusicImage: React.FC<{
  assetbundleName: string;
  title: string;
}> = ({ assetbundleName, title }) => {
  const [img, setImg] = useState<string>("");

  useEffect(() => {
    if (!img)
      getRemoteAssetURL(
        `music/jacket/${assetbundleName}_rip/${assetbundleName}.webp`,
        setImg
      );
  }, [assetbundleName, img]);

  return <Image src={img} alt={title} bgColor="" />;
};

const UnitDetail: React.FC<{}> = observer(() => {
  const { unitId } = useParams<{ unitId: string }>();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();
  const { region } = useRootStore();

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
    if (unitProfiles && gameCharas && musics && musicTags) {
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
      <TypographyHeader>
        {getTranslated(`unit_profile:${unit.unit}.name`, unit.unitName)}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <div style={{ textAlign: "center" }}>
          <img
            src={UnitLogoMap[region][unit.unit]}
            alt={unit.unitName}
            style={{ maxWidth: "100%" }}
          ></img>
        </div>
        <GridOut container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("unit:introduction")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={8}>
              <Grid container justifyContent="flex-end">
                <ContentTrans
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
            justifyContent="space-between"
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
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("member:scenario")}
              </Typography>
            </Grid>
            <Grid item container justifyContent="flex-end">
              <LinkNoDecoration to={`/storyreader/unitStory/${unit.unit}`}>
                <Grid container alignItems="center">
                  <OpenInNew />
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </GridOut>
      </ContainerContent>
      <TypographyHeader>
        {t("common:character", {
          count: unitCharas.length,
        })}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container direction="row" spacing={2} justifyContent="center">
          {unitCharas.map((uc) => (
            <Fragment key={`chara-${uc.id}`}>
              <Grid item xs={6} md={4} lg={3}>
                <Link to={"/chara/" + uc.id} style={{ textDecoration: "none" }}>
                  <Paper>
                    <Grid container direction="column" alignItems="center">
                      <Grid item>
                        <Grid
                          container
                          justifyContent="flex-end"
                          alignItems="flex-start"
                        >
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
                          characterId={uc.id}
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
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("common:music")}</TypographyHeader>
      <ContainerContent>
        <GridOut container direction="row" spacing={2} justifyContent="center">
          {unitMusics.map((um) => (
            <Fragment key={`music-${um.id}`}>
              <Grid item xs={6} md={3} lg={2}>
                <Link to={"/music/" + um.id} style={{ textDecoration: "none" }}>
                  <Paper>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <UnitMusicImage
                          assetbundleName={um.assetbundleName}
                          title={getTranslated(
                            `music_titles:${um.id}`,
                            um.title
                          )}
                          key={um.id}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ContentTrans
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
        </GridOut>
      </ContainerContent>
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, unit {unitId} does not exist.
    </div>
  );
});

export default UnitDetail;
