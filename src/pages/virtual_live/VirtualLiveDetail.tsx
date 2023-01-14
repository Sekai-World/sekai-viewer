import { Avatar, Divider, Grid, Paper, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Image from "mui-image";
import { IGameCharaUnit, IVirtualLiveInfo } from "../../types.d";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { charaIcons } from "../../utils/resources";
import ResourceBox from "../../components/widgets/ResourceBox";
import VirtualLiveStep from "./VirtualLiveStep";
// import AdSense from "../../components/blocks/AdSense";
import CommentTextMultiple from "~icons/mdi/comment-text-multiple";
import Comment from "../comment/Comment";
import { useStrapi } from "../../utils/apiClient";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import GridOut from "../../components/styled/GridOut";

const VirtualLiveDetail: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { id: virtualLiveId } = useParams<{ id: string }>();
  const { getTranslated } = useAssetI18n();
  const {
    settings: { contentTransMode },
    region,
  } = useRootStore();
  const { getVirtualLive } = useStrapi();

  const [virtualLives] = useCachedData<IVirtualLiveInfo>("virtualLives");
  const [gameCharacterUnits] =
    useCachedData<IGameCharaUnit>("gameCharacterUnits");

  const [virtualLive, setVirtualLive] = useState<IVirtualLiveInfo>();
  const [virtualLiveCommentId, setVirtualLiveCommentId] = useState<number>(0);

  useEffect(() => {
    if (virtualLive) {
      const name = getTranslated(
        `virtualLive_name:${virtualLiveId}`,
        virtualLive.name
      );
      document.title = t("title:eventDetail", {
        name,
      });
    }
  }, [contentTransMode, getTranslated, t, virtualLive, virtualLiveId]);

  useEffect(() => {
    if (virtualLives) {
      setVirtualLive(
        virtualLives.find((elem) => elem.id === Number(virtualLiveId))
      );
    }
  }, [virtualLives, virtualLiveId]);

  useEffect(() => {
    if (virtualLive) {
      const job = async () => {
        const virtualLiveStrapi = await getVirtualLive(virtualLive.id);
        if (virtualLiveStrapi) {
          setVirtualLiveCommentId(virtualLiveStrapi.id);
        }
      };

      job();
    }
  }, [getVirtualLive, virtualLive]);

  const [vrLiveLogo, setVrLiveLogo] = useState<string>("");
  const [vrLiveBanner, setVrLiveBanner] = useState<string>("");
  // const [vrLiveBackground, setVrLiveBackground] = useState<string>("");
  // const [vrLiveCharacter, setVrLiveCharacter] = useState<string>("");

  useEffect(() => {
    if (virtualLive) {
      getRemoteAssetURL(
        `virtual_live/select/banner/${virtualLive.assetbundleName}_rip/${virtualLive.assetbundleName}.webp`,
        setVrLiveLogo,
        "minio",
        region
      );
      getRemoteAssetURL(
        `home/banner/banner_virtuallive${virtualLiveId}_rip/banner_virtuallive${virtualLiveId}.webp`,
        setVrLiveBanner,
        "minio",
        region
      );
    }
  }, [region, virtualLive, virtualLiveId]);

  return virtualLive && gameCharacterUnits ? (
    <Fragment>
      <TypographyHeader>
        {getTranslated(`virtualLive_name:${virtualLiveId}`, virtualLive.name)}
      </TypographyHeader>
      <ContainerContent maxWidth="md">
        <Grid container direction="row" spacing={1} alignItems="center">
          <Grid item xs={12} md={6}>
            <Image
              src={vrLiveLogo}
              alt="logo"
              // aspectRatio={7 / 2}
              bgColor=""
            ></Image>
          </Grid>
          <Grid item xs={12} md={6}>
            <Image
              src={vrLiveBanner}
              alt="banner"
              // aspectRatio={7 / 3}
              bgColor=""
            ></Image>
          </Grid>
        </Grid>
        <GridOut container direction="column">
          <Grid
            item
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("virtual_live:live_characters")}
              </Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Grid container spacing={1} justifyContent="flex-end">
                {virtualLive.virtualLiveCharacters.map((chara) => (
                  <Grid item xs={4} md={3} lg={2}>
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("virtual_live:rewards")}
              </Typography>
            </Grid>
            <Grid item>
              <ResourceBox
                resourceBoxId={virtualLive.virtualLiveReward.resourceBoxId}
                resourceBoxPurpose="virtual_live_reward"
                justifyContent="center"
              />
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("virtual_live:title.schedules")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container spacing={1}>
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
        </GridOut>
      </ContainerContent>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
      <TypographyHeader>{t("virtual_live:title.setlist")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        {virtualLive.virtualLiveSetlists.map((setlist) => (
          <VirtualLiveStep key={setlist.id} data={setlist} />
        ))}
      </ContainerContent>
      {!!virtualLiveCommentId && (
        <Fragment>
          <TypographyHeader>
            {t("common:comment")} <CommentTextMultiple />
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <Comment
              contentType="virtual-live"
              contentId={virtualLiveCommentId}
            />
          </ContainerContent>
        </Fragment>
      )}
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, virtual live {virtualLiveId} does
      not exist.
    </div>
  );
});

export default VirtualLiveDetail;
