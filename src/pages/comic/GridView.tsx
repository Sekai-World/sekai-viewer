import { Card, CardContent, Typography, CardMedia } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ITipInfoComic } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "75%",
    backgroundSize: "contain",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
  },
}));

const GridView: React.FC<{
  data?: ITipInfoComic;
  index?: number;
  lang?: "ja" | "fr" | "ru" | "zhs" | "zht" | "en";
  handleCardClick?: (index: number) => void;
}> = ({ data, index, lang, handleCardClick }) => {
  const classes = useStyles();

  const [imageURL, setImageURL] = useState<string>("");

  useEffect(() => {
    if (data) {
      switch (lang) {
        case "ja":
        case "zht":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            window.isChinaMainland ? "cn" : "minio",
            lang === "zht" ? "tw" : "jp"
          );
          break;
        case "en":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            window.isChinaMainland ? "cn" : "minio",
            "en"
          );
          break;
        default:
          getRemoteAssetURL(
            `${lang}/${data.assetbundleName}.png`,
            setImageURL,
            window.isChinaMainland ? "cn" : "minio",
            "comic"
          );
          break;
      }
    }
  }, [data, lang]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rectangular" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.subheader}>
            <Skeleton
              variant="text"
              width="90%"
              style={{ margin: "auto" }}
            ></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={classes.card} onClick={() => handleCardClick!(index!)}>
      <CardMedia
        className={classes.media}
        image={imageURL}
        title={data.title}
      ></CardMedia>
      <CardContent style={{ paddingBottom: "16px" }}>
        <ContentTrans
          contentKey={`comic_title:${data.id}`}
          original={data.title}
          originalProps={{
            variant: "subtitle1",
          }}
          translatedProps={{
            variant: "subtitle1",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default GridView;
