import { Grid, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Image from "mui-image";
import { getRemoteAssetURL } from "../../utils";
import { useCurrentEvent } from "../../utils/apiClient";
import Countdown from "./Countdown";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import TypographyHeader from "../styled/TypographyHeader";
import ContainerContent from "../styled/ContainerContent";

const CurrentEventWidget: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { currEvent, error } = useCurrentEvent();
  const { region } = useRootStore();

  const [eventBanner, setEventBanner] = useState("");

  useEffect(() => {
    if (currEvent) {
      getRemoteAssetURL(
        `home/banner/${currEvent.eventJson.assetbundleName}_rip/${currEvent.eventJson.assetbundleName}.webp`,
        setEventBanner,
        window.isChinaMainland ? "cn" : "minio",
        region
      );
    }
  }, [currEvent, region]);

  return (
    <Grid container>
      <TypographyHeader>{t("common:ongoing_event")}</TypographyHeader>
      <ContainerContent>
        <Grid container spacing={2} justifyContent="center">
          {eventBanner ? (
            <Grid item xs={12} sm={7}>
              <Link to={`/event/${currEvent?.eventId}`}>
                <Image
                  src={eventBanner}
                  alt="event banner"
                  // className={classes.banner}
                  // aspectRatio={5 / 2}
                  bgColor=""
                  showLoading
                />
              </Link>
            </Grid>
          ) : error ? null : (
            <Grid item xs={12} container justifyContent="center">
              <Skeleton variant="rectangular" height={100} width={250} />
            </Grid>
          )}
          {currEvent && (
            <Grid item xs={12} container justifyContent="center">
              <Countdown endDate={new Date(currEvent.eventJson.aggregateAt)}>
                <Typography variant="h4">{t("event:alreadyEnded")}</Typography>
              </Countdown>
            </Grid>
          )}
        </Grid>
      </ContainerContent>
    </Grid>
  );
});

export default CurrentEventWidget;
