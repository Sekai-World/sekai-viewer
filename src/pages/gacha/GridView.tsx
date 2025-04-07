import { Card, CardContent, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { IGachaInfo } from "../../types.d";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import CardMediaCardImg from "../../components/styled/CardMediaCardImg";
import SpoilerCard from "../../components/helpers/SpoilerCard";

const GridView: React.FC<{ data?: IGachaInfo }> = observer(({ data }) => {
  const { path } = useRouteMatch();
  const { region } = useRootStore();

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `gacha/${data.assetbundleName}/logo/logo.webp`,
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
            paddingTop: "56.25%",
            position: "relative",
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
    <SpoilerCard
      releaseTime={new Date(data.startAt)}
      toPath={path + "/" + data.id}
    >
      <CardMediaCardImg
        image={url}
        title={data.name}
        sx={{ backgroundSize: "contain" }}
      ></CardMediaCardImg>
      <CardContent style={{ paddingBottom: "16px" }}>
        <ContentTrans
          contentKey={`gacha_name:${data.id}`}
          original={data.name}
          originalProps={{
            sx: {
              maxWidth: "260px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            variant: "subtitle1",
          }}
          translatedProps={{
            sx: {
              maxWidth: "260px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
            variant: "subtitle1",
          }}
        />
        <Typography variant="body2" color="textSecondary">
          {new Date(data.startAt).toLocaleString()} ~
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {new Date(data.endAt).toLocaleString()}
        </Typography>
      </CardContent>
    </SpoilerCard>
  );
});

export default GridView;
