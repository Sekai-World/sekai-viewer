import { Grid, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { useLayoutStyles } from "../styles/layout";
import { IGameChara, IUnitProfile } from "../types.d";
import { getRemoteAssetURL, useCachedData, useServerRegion } from "../utils";
import { UnitLogoMap } from "../utils/resources";

const useStyle = makeStyles((theme) => ({
  unitIcon: {
    [theme.breakpoints.down("md")]: {
      height: "48px",
    },
    height: "96px",
  },
  memberSelectImg: {
    width: "100%",
    cursor: "pointer",
  },
}));

const MemberImage: React.FC<{ id: number }> = ({ id }) => {
  const classes = useStyle();
  const { path } = useRouteMatch();
  const [region] = useServerRegion();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    getRemoteAssetURL(
      `character/character_select_rip/chr_tl_${id}.webp`,
      setUrl,
      window.isChinaMainland ? "cn" : "ww",
      region
    );
  }, [id, region]);

  return (
    <Grid item xs={3} md={2} key={`chara-${id}`}>
      <Link to={path + "/" + id} style={{ textDecoration: "none" }}>
        <img
          className={classes.memberSelectImg}
          src={url}
          alt={String(id)}
        ></img>
      </Link>
    </Grid>
  );
};

const MemberList: React.FC<{}> = () => {
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const [region] = useServerRegion();

  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [gameCharas] = useCachedData<IGameChara>("gameCharacters");

  const [charaUnitMap, setCharaUnitMap] = useState<{
    [key: string]: IGameChara[];
  }>({});

  useEffect(() => {
    document.title = t("title:memberList");
  }, [t]);

  useEffect(() => {
    if (
      unitProfiles &&
      unitProfiles.length &&
      gameCharas &&
      gameCharas.length
    ) {
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
        {t("common:character")}
      </Typography>
      <Grid container spacing={1} direction="column">
        {Object.keys(charaUnitMap).map((unit) => (
          <Fragment key={`unit-${unit}`}>
            <Grid
              item
              container
              justifyContent="center"
              style={{ margin: "0.3em 0" }}
            >
              <Link to={"/unit/" + unit}>
                <img
                  className={classes.unitIcon}
                  src={UnitLogoMap[region][unit]}
                  alt={unit}
                ></img>
              </Link>
            </Grid>
            <Grid
              item
              container
              justifyContent="center"
              spacing={2}
              style={{ marginBottom: "1em" }}
            >
              {charaUnitMap[unit].map((chara) => (
                <MemberImage id={chara.id} />
              ))}
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </Fragment>
  );
};

export default MemberList;
