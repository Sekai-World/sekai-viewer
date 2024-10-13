import { Card, CardContent, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IGachaInfo, ServerRegion } from "../../types";
import { getRemoteAssetURL } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";
import { observer } from "mobx-react-lite";
import CardMediaCardImg from "../../components/styled/CardMediaCardImg";

const GridView: React.FC<{ data?: IGachaInfo }> = observer(({ data }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (data) {
      getRemoteAssetURL(
        `gacha/${data.assetbundleName}/logo_rip/logo.webp`,
        setUrl,
        "minio",
        "jp" as ServerRegion
      );
    }
  }, [data]);

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
    // kinda a brute forced way of doing it tbh, but I just removed the path and set it to send to gacha
    <Link to={"gacha/" + data.id} style={{ textDecoration: "none" }}>
      <Card sx={{ cursor: "pointer" }}>
        <CardMediaCardImg
          image={url}
          title={data.name}
          sx={{ backgroundSize: "contain" }}
        >
          <SpoilerTag
            style={{
              left: "1%",
              position: "absolute",
              top: "1%",
            }}
            releaseTime={new Date(data.startAt)}
          />
        </CardMediaCardImg>
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
      </Card>
    </Link>
  );
});

export default GridView;
