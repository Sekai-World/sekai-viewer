import { Grid, styled } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { IGameChara, IUnitProfile } from "../types.d";
import { getRemoteAssetURL, useCachedData } from "../utils";
import { UnitLogoMap } from "../utils/resources";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../stores/root";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";

const MemberSelectImg = styled("img")`
  width: 100%;
  cursor: pointer;
`;

const MemberImage: React.FC<{ id: number }> = ({ id }) => {
  const { path } = useRouteMatch();
  const { region } = useRootStore();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    getRemoteAssetURL(
      `character/character_select_rip/chr_tl_${id}.webp`,
      setUrl,
      window.isChinaMainland ? "cn" : "minio",
      region
    );
  }, [id, region]);

  return (
    <Grid item xs={3} md={2} key={`chara-${id}`}>
      <Link to={path + "/" + id} style={{ textDecoration: "none" }}>
        <MemberSelectImg src={url} alt={String(id)}></MemberSelectImg>
      </Link>
    </Grid>
  );
};

const UnitIconImg = styled("img")(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    height: "48px",
  },
  height: "96px",
}));

const MemberList: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { region } = useRootStore();

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
      <TypographyHeader>{t("common:character")}</TypographyHeader>
      <ContainerContent>
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
                  <UnitIconImg
                    src={UnitLogoMap[region][unit]}
                    alt={unit}
                  ></UnitIconImg>
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
      </ContainerContent>
    </Fragment>
  );
});

export default MemberList;
