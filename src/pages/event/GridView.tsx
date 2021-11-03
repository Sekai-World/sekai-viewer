import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import { IEventInfo } from "../../types.d";
import { getRemoteAssetURL, useServerRegion } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
    backgroundSize: "contain",
    position: "relative",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  header: {
    // "white-space": "nowrap",
    // overflow: "hidden",
    // "text-overflow": "ellipsis",
    // [theme.breakpoints.down("md")]: {
    //   "max-width": "200px",
    // },
    // "max-width": "250px",
  },
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

const GridView: React.FC<{ data?: IEventInfo }> = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { path } = useRouteMatch();
  const [region] = useServerRegion();

  const [eventLogo, setEventLogo] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `event/${data.assetbundleName}/logo_rip/logo.webp`,
        setEventLogo,
        window.isChinaMainland ? "cn" : "ww",
        region
      );
    }
  }, [data, region]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rectangular" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="40%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={eventLogo}
          title={getTranslated(`event_name:${data.id}`, data.name)}
        >
          <SpoilerTag
            style={{
              position: "absolute",
              top: "1%",
              left: "1%",
            }}
            releaseTime={new Date(data.startAt)}
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`event_name:${data.id}`}
                original={data.name}
                originalProps={{
                  variant: "subtitle1",
                  className: classes.header,
                }}
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                {t(`event:type.${data.eventType}`)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(data.startAt).toLocaleString()} ~
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(data.aggregateAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GridView;
