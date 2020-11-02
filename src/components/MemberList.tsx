import { Grid, makeStyles, Typography } from "@material-ui/core";
import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { useLayoutStyles } from "../styles/layout";
import { ContentTransModeType } from "../types";
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

  useEffect(() => {
    document.title = t("title:memberList");
  }, [t]);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:member")}
      </Typography>
      <Grid container spacing={1} direction="column">
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["piapro"]}
            alt="piapro"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[21, 22, 23, 24, 25, 26].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["light_sound"]}
            alt="light_sound"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["idol"]}
            alt="idol"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[5, 6, 7, 8].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["street"]}
            alt="street"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[9, 10, 11, 12].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["theme_park"]}
            alt="theme_park"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[13, 14, 15, 16].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item container justify="center">
          <img
            className={classes.unitIcon}
            src={UnitLogoMap["school_refusal"]}
            alt="school_refusal"
          ></img>
        </Grid>
        <Grid item container justify="center" spacing={2}>
          {[17, 18, 19, 20].map((i) => (
            <Grid item xs={4} md={2} key={`chara-${i}`}>
              <Link to={path + "/" + i} style={{ textDecoration: "none" }}>
                <img
                  className={classes.memberSelectImg}
                  src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/character_select_rip/chr_tl_${i}.webp`}
                  alt={String(i)}
                ></img>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default MemberList;
