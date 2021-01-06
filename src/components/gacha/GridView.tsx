import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { IGachaInfo } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../subs/ContentTrans";
import SpoilerTag from "../subs/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "260px",
  },
}));

const GridView: React.FC<{ data?: IGachaInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `gacha/${data.assetbundleName}/logo_rip/logo.webp`,
        setUrl
      );
    }
  }, [data]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rect" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.subheader}>
            <Skeleton variant="text" width="90%"></Skeleton>
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
          image={url}
          title={data.name}
        ></CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <SpoilerTag releaseTime={new Date(data.startAt)} />
          <ContentTrans
            contentKey={`gacha_name:${data.id}`}
            original={data.name}
            originalProps={{
              variant: "subtitle1",
              className: classes.subheader,
            }}
            translatedProps={{
              variant: "subtitle1",
              className: classes.subheader,
            }}
          />
          <Typography variant="body2" color="textSecondary">
            {new Date(data.startAt).toLocaleString()} ~
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {new Date(data.endAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GridView;
