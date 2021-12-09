import {
  Container,
  Grid,
  /* makeStyles, */
  Typography,
} from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Image from "mui-image";
import { useLayoutStyles } from "../../styles/layout";
import { getRemoteAssetURL } from "../../utils";
import { useCurrentEvent } from "../../utils/apiClient";
import Countdown from "./Countdown";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";

// const useStyles = makeStyles((theme) => ({
//   banner: {
//     [theme.breakpoints.up("md")]: {
//       maxWidth: "60%",
//     },
//     maxWidth: "90%",
//   },
// }));

const CurrentEventWidget: React.FC<{}> = observer(() => {
  // const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { currEvent, error } = useCurrentEvent();
  const { region } = useRootStore();

  const [eventBanner, setEventBanner] = useState("");

  useEffect(() => {
    if (currEvent) {
      getRemoteAssetURL(
        `home/banner/${currEvent.eventJson.assetbundleName}_rip/${currEvent.eventJson.assetbundleName}.webp`,
        setEventBanner,
        window.isChinaMainland ? "cn" : "ww",
        region
      );
    }
  }, [currEvent, region]);

  return (
    <Grid container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:ongoing_event")}
      </Typography>
      <Container className={layoutClasses.content}>
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
      </Container>
    </Grid>
  );
});

export default CurrentEventWidget;
