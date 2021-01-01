import { Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SekaiCurrentEventModel } from "../../strapi-model";
import { useLayoutStyles } from "../../styles/layout";
import { getRemoteAssetURL } from "../../utils";
import { useStrapi } from "../../utils/apiClient";
import Countdown from "../subs/Countdown";

const useStyles = makeStyles((theme) => ({
  banner: {
    [theme.breakpoints.up("md")]: {
      maxWidth: "50%",
    },
    maxWidth: "90%",
  },
}));

const CurrentEventWidget: React.FC<{}> = () => {
  const classes = useStyles();
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
          {eventBanner ? (
            <Grid item xs={12}>
              <Link to={`/event/${currEvent?.eventId}`}>
                <Grid container justify="center">
                  <img
                    src={eventBanner}
                    alt="event banner"
                    className={classes.banner}
                  />
                </Grid>
              </Link>
            </Grid>
          ) : (
            <Grid item xs={12} container justify="center">
              <Skeleton variant="rect" height={100} width={250} />
            </Grid>
          )}
          {currEvent && (
            <Grid item xs={12} container justify="center">
              <Countdown endDate={new Date(currEvent.eventJson.aggregateAt)}>
                <Typography>{t("event:alreadyEnded")}</Typography>
              </Countdown>
            </Grid>
          )}
        </Grid>
      </Container>
    </Grid>
  );
};

export default CurrentEventWidget;
