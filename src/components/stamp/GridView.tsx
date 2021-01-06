import {
  Card,
  CardContent,
  Typography,
  Link,
  CardMedia,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { IStampInfo } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../subs/ContentTrans";

const useStyles = makeStyles((theme) => ({
  media: {
    marginTop: "0.5em",
    paddingTop: "75%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    // "white-space": "nowrap",
    // overflow: "hidden",
    // "text-overflow": "ellipsis",
    // "max-width": "260px",
  },
}));

const GridView: React.FC<{ data?: IStampInfo }> = ({ data }) => {
  const classes = useStyles();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`,
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
    <Link href={url} target="_blank" style={{ textDecoration: "none" }}>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={url}
          title={data.name}
        ></CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <ContentTrans
            contentKey={`stamp_name:${data.id}`}
            original={data.name.replace(/\[.*\]/, "").replace(/^.*：/, "")}
            originalProps={{
              variant: "subtitle1",
            }}
            translatedProps={{
              variant: "subtitle1",
            }}
          />
        </CardContent>
      </Card>
    </Link>
  );
};

export default GridView;
