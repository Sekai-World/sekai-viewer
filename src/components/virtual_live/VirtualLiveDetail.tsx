import {
  Avatar,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Image from "material-ui-image";
import { SettingContext } from "../../context";
// import { useInteractiveStyles } from "../../styles/interactive";
import { useLayoutStyles } from "../../styles/layout";
import { IGameCharaUnit, IVirtualLiveInfo } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../subs/ContentTrans";
import { charaIcons } from "../../utils/resources";
import ResourceBox from "../subs/ResourceBox";
import VirtualLiveStep from "./VirtualLiveStep";

const VirtualLiveDetail: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { id: virtualLiveId } = useParams<{ id: string }>();
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [virtualLives] = useCachedData<IVirtualLiveInfo>("virtualLives");
  const [gameCharacterUnits] = useCachedData<IGameCharaUnit>(
    "gameCharacterUnits"
  );

  const [virtualLive, setVirtualLive] = useState<IVirtualLiveInfo>();

  useEffect(() => {
    if (virtualLive) {
      const name = getTranslated(
        contentTransMode,
        `virtualLive_name:${virtualLiveId}`,
        virtualLive.name
      );
      document.title = t("title:eventDetail", {
        name,
      });
    }
  }, [contentTransMode, getTranslated, t, virtualLive, virtualLiveId]);

  useEffect(() => {
    if (virtualLives.length) {
      setVirtualLive(
        virtualLives.find((elem) => elem.id === Number(virtualLiveId))
      );
    }
  }, [virtualLives, virtualLiveId]);

  const [vrLiveLogo, setVrLiveLogo] = useState<string>("");
  const [vrLiveBanner, setVrLiveBanner] = useState<string>("");
  // const [vrLiveBackground, setVrLiveBackground] = useState<string>("");
  // const [vrLiveCharacter, setVrLiveCharacter] = useState<string>("");

  useEffect(() => {
    if (virtualLive) {
      getRemoteAssetURL(
        `virtual_live/select/banner/${virtualLive.assetbundleName}_rip/${virtualLive.assetbundleName}.webp`,
        setVrLiveLogo
      );
      getRemoteAssetURL(
        `home/banner/banner_virtuallive${virtualLiveId}_rip/banner_virtuallive${virtualLiveId}.webp`,
        setVrLiveBanner
      );
    }
  }, [virtualLive, virtualLiveId]);

  return virtualLive && gameCharacterUnits.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getTranslated(
          contentTransMode,
          `virtualLive_name:${virtualLiveId}`,
          virtualLive.name
        )}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid container direction="row" spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Image
              src={vrLiveLogo}
              alt="logo"
              aspectRatio={7 / 2}
              color=""
            ></Image>
          </Grid>
          <Grid item xs={12} md={6}>
            <Image
              src={vrLiveBanner}
              alt="banner"
              aspectRatio={7 / 3}
              color=""
            ></Image>
          </Grid>
        </Grid>
        <Grid
          className={layoutClasses["grid-out"]}
          container
          direction="column"
        >
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:id")}
            </Typography>
            <Typography>{virtualLive.id}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:title")}
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction="column" spacing={1}>
                <ContentTrans
                  contentKey={`virtualLive_name:${virtualLiveId}`}
                  original={virtualLive.name}
                  originalProps={{ align: "right" }}
                  translatedProps={{ align: "right" }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:type")}
            </Typography>
            <Typography>
              {t(`virtual_live:type.${virtualLive.virtualLiveType}`)}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:startAt")}
            </Typography>
            <Typography align="right">
              {new Date(virtualLive.startAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:endAt")}
            </Typography>
            <Typography align="right">
              {new Date(virtualLive.endAt).toLocaleString()}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("virtual_live:live_characters")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Grid container spacing={1} justify="flex-end">
                {virtualLive.virtualLiveCharacters.map((chara) => (
                  <Grid item xs={4} md={3}>
                    <Avatar
                      src={
                        charaIcons[
                          `CharaIcon${
                            gameCharacterUnits.find(
                              (gcu) => gcu.id === chara.gameCharacterUnitId
                            )!.gameCharacterId
                          }`
                        ]
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("virtual_live:rewards")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <ResourceBox
                resourceBoxId={virtualLive.virtualLiveReward.resourceBoxId}
                resourceBoxPurpose="virtual_live_reward"
                justify="flex-end"
              />
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("virtual_live:title.schedules")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid className={layoutClasses["grid-out"]} container spacing={1}>
          {virtualLive.virtualLiveSchedules.map((schedule) => (
            <Grid key={schedule.id} item xs={12} md={4} lg={3}>
              <Paper style={{ padding: "2%" }}>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      {t("virtual_live:schedule.start")}
                    </Typography>
                    <Typography>
                      {new Date(schedule.startAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      {t("virtual_live:schedule.end")}
                    </Typography>
                    <Typography>
                      {new Date(schedule.endAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("virtual_live:title.setlist")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <Grid className={layoutClasses["grid-out"]} container spacing={1}>
          {virtualLive.virtualLiveSetlists.map((setlist) => (
            <Grid item xs={12}>
              <VirtualLiveStep data={setlist} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, virtual live {virtualLiveId} does
      not exist.
    </div>
  );
};

export default VirtualLiveDetail;
