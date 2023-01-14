import { Card, CardContent, Typography, CardMedia } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ComicLangType, ITipInfoComic } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";

const GridView: React.FC<{
  data?: ITipInfoComic;
  index?: number;
  lang?: ComicLangType;
  handleCardClick?: (index: number) => void;
}> = ({ data, index, lang, handleCardClick }) => {
  const [imageURL, setImageURL] = useState<string>("");

  useEffect(() => {
    if (data) {
      switch (lang) {
        case "ja":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            "minio",
            "jp"
          );
          break;
        case "zht":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            "minio",
            "tw"
          );
          break;
        case "en":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            "minio",
            "en"
          );
          break;
        case "kr":
          getRemoteAssetURL(
            `comic/one_frame_rip/${data.assetbundleName}.webp`,
            setImageURL,
            "minio",
            "kr"
          );
          break;
        default:
          getRemoteAssetURL(
            `${lang}/${data.assetbundleName}.png`,
            setImageURL,
            "minio",
            "comic"
          );
          break;
      }
    }
  }, [data, lang]);

  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            backgroundSize: "contain",
            paddingTop: "75%",
          }}
        ></Skeleton>
        <CardContent>
          <Typography variant="subtitle1">
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
    <Card
      sx={{
        cursor: "pointer",
      }}
      onClick={() => handleCardClick!(index!)}
    >
      <CardMedia
        sx={{
          backgroundSize: "contain",
          paddingTop: "75%",
        }}
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
