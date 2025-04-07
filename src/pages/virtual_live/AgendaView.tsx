import { Typography, Grid, Container, Paper } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IVirtualLiveInfo } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import Image from "mui-image";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import SpoilerCard from "../../components/helpers/SpoilerCard";
import AgendaBox from "../../components/styled/AgendaBox";
import AgendaPaper from "../../components/styled/AgendaPaper";

const AgendaView: React.FC<{ data?: IVirtualLiveInfo }> = observer(
  ({ data }) => {
    const { t } = useTranslation();
    const { getTranslated } = useAssetI18n();
    const { region } = useRootStore();

    const [virtualLiveLogo, setVirtualLiveLogo] = useState<string>("");

    useEffect(() => {
      if (data) {
        getRemoteAssetURL(
          `virtual_live/select/banner/${data.assetbundleName}/${data.assetbundleName}.png`,
          setVirtualLiveLogo,
          "minio",
          region
        );
      }
    }, [data, region]);

    if (!data) {
      // loading
      return (
        <Container maxWidth="md">
          <Grid
            container
            spacing={2}
            component={Paper}
            sx={(theme) => ({ margin: theme.spacing("1%", 0) })}
          >
            <Grid item xs={12} md={4} container alignItems="center">
              <Skeleton
                variant="rectangular"
                sx={() => ({
                  backgroundSize: "contain",
                  paddingTop: "30%",
                  width: "100%",
                })}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction="column" spacing={1}>
                <Typography variant="subtitle1">
                  <Skeleton variant="text" width="90%"></Skeleton>
                </Typography>
                <Typography variant="body2">
                  <Skeleton variant="text" width="40%"></Skeleton>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      );
    }
    return (
      <SpoilerCard
        releaseTime={data.startAt}
        toPath={"/virtual_live/" + data.id}
        component={AgendaBox}
      >
        <AgendaPaper>
          <Grid
            container
            alignItems="center"
            spacing={2}
            justifyContent="space-between"
          >
            <Grid item xs={12} md={4}>
              <Image
                src={virtualLiveLogo}
                alt={getTranslated(`virtualLive_name:${data.id}`, data.name)}
                // aspectRatio={3.2562}
                bgColor=""
              ></Image>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container direction="column" columnSpacing={1}>
                <Grid item>
                  <ContentTrans
                    contentKey={`virtualLive_name:${data.id}`}
                    original={data.name}
                    originalProps={{
                      variant: "subtitle1",
                    }}
                  />
                </Grid>
                <Grid item container columnSpacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      {t(`virtual_live:type.${data.virtualLiveType}`)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="span"
                    >
                      {new Date(data.startAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="span"
                    >
                      ~
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="span"
                    >
                      {new Date(data.endAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AgendaPaper>
      </SpoilerCard>
    );
  }
);

export default AgendaView;
