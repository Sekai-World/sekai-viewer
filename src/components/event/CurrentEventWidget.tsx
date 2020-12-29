import { CardMedia, Container, Grid, Typography } from "@material-ui/core";
import FlipCountdown from "@rumess/react-flip-countdown";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SekaiCurrentEventModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { getRemoteAssetURL } from "../../utils";
import { useStrapi } from "../../utils/apiClient";

const CurrentEventWidget: React.FC<{}> = () => {
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { getSekaiCurrentEvent } = useStrapi();

  const [currEvent, setCurrEvent] = useState<SekaiCurrentEventModel>();
  const [eventBanner, setEventBanner] = useState("");

  useEffect(() => {
    if (currEvent) {
      getRemoteAssetURL(
        `home/banner/${currEvent.eventJson.assetbundleName}_rip/${currEvent.eventJson.assetbundleName}.webp`,
        setEventBanner
      );
    } else getSekaiCurrentEvent().then(setCurrEvent);
  }, [currEvent, getSekaiCurrentEvent]);

  return (
    <Grid container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:ongoing_event")}
      </Typography>
      <Container className={layoutClasses.content}>
        <Grid container spacing={1}>
          {eventBanner && (
            <Grid item xs={12} container justify="center">
              <img
                src={eventBanner}
                alt="event banner"
                style={{ maxWidth: "100%" }}
              />
            </Grid>
          )}
          {currEvent &&
            (currEvent.eventJson.aggregateAt >= new Date().getTime() ? (
              <Grid item xs={12} container justify="center">
                <FlipCountdown
                  endAt={new Date(
                    currEvent.eventJson.aggregateAt
                  ).toISOString()}
                  hideYear
                  hideMonth
                  titlePosition="bottom"
                />
              </Grid>
            ) : (
              <Typography>{t("event:alreadyEnded")}</Typography>
            ))}
        </Grid>
      </Container>
    </Grid>
  );
};

export default CurrentEventWidget;
