import {
  Container,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType, IGameChara, IUnitProfile } from "../types";
import { useCachedData, useCharaName } from "../utils";
import { charaIcons, UnitLogoMap } from "../utils/resources";

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

const UnitDetail: React.FC<{ contentTransMode: ContentTransModeType }> = ({
  contentTransMode,
}) => {
  const { unitId } = useParams<{ unitId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  // const { assetT } = useAssetI18n();
  const getCharaName = useCharaName(contentTransMode);

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");

  const [unit, setUnit] = useState<IUnitProfile>();
  const [unitCharas, setUnitCharas] = useState<IGameChara[]>([]);

  useEffect(() => {
    document.title = t("title:unitDetail", { name: unit?.unitName });
  }, [t, unit]);

  useEffect(() => {
    if (unitProfiles.length && gameCharas) {
      setUnit(unitProfiles.find((up) => up.unit === unitId));
      setUnitCharas(gameCharas.filter((gc) => gc.unit === unitId));
    }
  }, [unitProfiles, unitId, gameCharas]);

  return unit ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {unit.unitName}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <img src={UnitLogoMap[unit.unit]} alt={unit.unitName}></img>
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
                <Typography>{unit.profileSentence}</Typography>
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
                  <div
                    style={{
                      height: "26px",
                      width: "26px",
                      border: "solid 2px white",
                      backgroundColor: unit.colorCode,
                    }}
                  ></div>
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
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid className={classes["grid-out"]} container direction="column">
          {unitCharas.map((uc) => (
            <Fragment key={`chara-${uc.id}`}>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Link
                    to={"/chara/" + uc.id}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: 600 }}
                      color="textPrimary"
                    >
                      {getCharaName(uc.id)}
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={6} md={8}>
                  <Grid container justify="flex-end">
                    <Link
                      to={"/chara/" + uc.id}
                      style={{ textDecoration: "none" }}
                    >
                      <img
                        key={uc.id}
                        height="42"
                        src={charaIcons[`CharaIcon${uc.id}`]}
                        alt={getCharaName(uc.id)}
                      ></img>
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
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
