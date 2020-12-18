import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { SettingContext } from "../../context";
import { ITipInfoComic } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../subs/ContentTrans";

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
  lang?: string;
  handleCardClick?: (index: number) => void;
}> = ({ data, index, lang, handleCardClick }) => {
  const { contentTransMode } = useContext(SettingContext)!;
  const classes = useStyles();

  const [imageURL, setImageURL] = useState<string>("");

  useEffect(() => {
    if (data) {
      switch (lang) {
        case "ja":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL
          );
          break;
        default:
          getRemoteAssetURL(
            `comic_${lang}/${data.assetbundleName}.png`,
            setImageURL
          );
          break;
      }
    }
  }, [data, lang]);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rect" className={classes.media}></Skeleton>
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
          mode={contentTransMode}
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
