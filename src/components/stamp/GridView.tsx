import { Card, CardContent, Typography, Link, CardMedia } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IStampInfo } from "../../types";
import { getRemoteAssetURL, useServerRegion } from "../../utils";
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
  const [region] = useServerRegion();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`,
        setUrl,
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
          <Typography variant="subtitle1" className={classes.subheader}>
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Link
      href={url.replace(".webp", ".png")}
      target="_blank"
      style={{ textDecoration: "none" }}
      underline="hover"
    >
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
