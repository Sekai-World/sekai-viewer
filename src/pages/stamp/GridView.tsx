import { Card, CardContent, Typography, Link, CardMedia } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IStampInfo } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";

const GridView: React.FC<{ data?: IStampInfo }> = observer(({ data }) => {
  const { region } = useRootStore();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `stamp/${data.assetbundleName}_rip/${data.assetbundleName}/${data.assetbundleName}.webp`,
        setUrl,
        "minio",
        region
      );
    }
  }, [data, region]);

  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            backgroundSize: "contain",
            marginTop: "0.5em",
            paddingTop: "75%",
          }}
        ></Skeleton>
        <CardContent>
          <Typography variant="subtitle1">
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
      <Card sx={{ cursor: "pointer" }}>
        <CardMedia
          sx={{
            backgroundSize: "contain",
            marginTop: "0.5em",
            paddingTop: "75%",
          }}
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
});

export default GridView;
