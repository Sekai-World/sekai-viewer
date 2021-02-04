import { Button, Grid, Tooltip, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import Image from "material-ui-image";
import { UserContext } from "../../../context";
import { charaIcons } from "../../../utils/resources";
import DegreeImage from "../../subs/DegreeImage";
import { useCachedData, useToggle } from "../../../utils";
import { IAreaItem } from "../../../types";

const SekaiUserStatistics = () => {
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { sekaiProfile } = useContext(UserContext)!;

  const [areaItems] = useCachedData<IAreaItem>("areaItems");

  const [characterRankOpen, toggleCharacterRankOpen] = useToggle(false);
  const [honorOpen, toggleHonorOpen] = useToggle(false);
  const [areaItemOpen, toggleAreaItemOpen] = useToggle(false);
  const [musicOpen, toggleMusicOpen] = useToggle(false);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography>{t("mission:type.character_rank")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleCharacterRankOpen()}
        >
          {characterRankOpen ? t("common:hide") : t("common:show")}
        </Button>
        {characterRankOpen && (
          <Grid container spacing={1}>
            {sekaiProfile?.sekaiUserProfile?.userCharacters.map((chara) => (
              <Grid key={chara.characterId} item xs={3} md={2} lg={1}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Image
                      src={charaIcons[`CharaIcon${chara.characterId}`]}
                      alt={`cahra ${chara.characterId}`}
                      aspectRatio={1}
                      // style={{ height: "64px", width: "64px" }}
                      color=""
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography align="center">
                      {chara.characterRank}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:mission.honor")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleHonorOpen()}
        >
          {honorOpen ? t("common:hide") : t("common:show")}
        </Button>
        {honorOpen && (
          <Grid container spacing={1}>
            {sekaiProfile?.sekaiUserProfile?.userHonors.map((honor) => (
              <Grid key={honor.honorId} item xs={12} sm={6} md={3}>
                <Tooltip title={new Date(honor.obtainedAt).toLocaleString()}>
                  <div>
                    <DegreeImage
                      honorId={honor.honorId}
                      honorLevel={honor.level}
                    />
                  </div>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:area_item")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleAreaItemOpen()}
        >
          {areaItemOpen ? t("common:hide") : t("common:show")}
        </Button>
        {areaItemOpen && !!areaItems && (
          <Grid container spacing={2}>
            {sekaiProfile?.sekaiUserProfile?.userAreaItems.map((areaItem) => (
              <Grid key={areaItem.areaItemId} item xs={4} md={2}>
                <Tooltip
                  title={
                    areaItems.find((ai) => ai.id === areaItem.areaItemId)!.name
                  }
                >
                  <Grid container>
                    <Grid item xs={12}>
                      <Image
                        src={`${
                          window.isChinaMainland
                            ? `${process.env.REACT_APP_ASSET_DOMAIN_CN}`
                            : `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets`
                        }/thumbnail/areaitem_rip/${
                          areaItems.find((ai) => ai.id === areaItem.areaItemId)!
                            .assetbundleName
                        }.png`}
                        alt={`area item ${areaItem.areaItemId}`}
                        aspectRatio={1}
                        // style={{ height: "64px", width: "64px" }}
                        color=""
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography align="center">{areaItem.level}</Typography>
                    </Grid>
                  </Grid>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:music")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleMusicOpen()}
          disabled
        >
          {musicOpen ? t("common:hide") : t("common:show")}
        </Button>
      </Grid>
    </Grid>
  );
};

export default SekaiUserStatistics;
