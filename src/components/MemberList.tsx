import { Grid, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType, IGameChara, IUnitProfile } from "../types";
import { useCachedData } from "../utils";
import { UnitLogoMap } from "../utils/resources";

const useStyle = makeStyles((theme) => ({
  unitIcon: {
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
    height: "96px",
  },
  memberSelectImg: {
    width: "100%",
    cursor: "pointer",
  },
}));

const MemberList: React.FC<{ contentTransMode: ContentTransModeType }> = ({
  contentTransMode,
}) => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { path } = useRouteMatch();

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");

  const [charaUnitMap, setCharaUnitMap] = useState<{
    [key: string]: IGameChara[];
  }>({});

  useEffect(() => {
    document.title = t("title:memberList");
  }, [t]);

  useEffect(() => {
    if (unitProfiles.length && gameCharas.length) {
      const units = unitProfiles
        .sort((a, b) => a.seq - b.seq)
        .map((up) => up.unit);
      setCharaUnitMap(
        units.reduce<{ [key: string]: IGameChara[] }>((sum, unit) => {
          sum[unit] = gameCharas.filter((gc) => gc.unit === unit);
          return sum;
        }, {})
      );
    }
  }, [unitProfiles, gameCharas]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:member")}
      </Typography>
      <Grid container spacing={1} direction="column">
        {Object.keys(charaUnitMap).map((unit) => (
          <Fragment key={`unit-${unit}`}>
            <Grid item container justify="center" style={{ margin: "0.3em 0" }}>
              <Link to={"/unit/" + unit}>
                <img
                  className={classes.unitIcon}
                  src={UnitLogoMap[unit]}
                  alt="piapro"
                ></img>
              </Link>
            </Grid>
            <Grid
              item
              container
              justify="center"
              spacing={2}
              style={{ marginBottom: "1em" }}
            >
              {charaUnitMap[unit].map((chara) => (
                <Grid item xs={3} md={2} key={`chara-${chara.id}`}>
                  <Link
                    to={path + "/" + chara.id}
                    style={{ textDecoration: "none" }}
                  >
                    <img
                      className={classes.memberSelectImg}
                      src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${chara.id}.webp`}
                      alt={String(chara.id)}
                    ></img>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </Fragment>
  );
};

export default MemberList;
