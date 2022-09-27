import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import { Skeleton } from "@mui/material";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types.d";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { CardSmallImage } from "../../components/widgets/CardImage";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";
import LinkNoDecorationAlsoNoHover from "../../components/styled/LinkNoDecorationAlsoHover";

const GridView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const { path } = useRouteMatch();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            paddingTop: "56.25%",
          }}
        ></Skeleton>
        <CardContent>
          <Typography variant="subtitle1">
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="30%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <LinkNoDecorationAlsoNoHover to={path + "/" + data.id}>
      <Card
        sx={{
          cursor: "pointer",
        }}
      >
        <CardMedia
          title={getTranslated(`card_prefix:${data.id}`, data.prefix)}
          style={{
            position: "relative",
          }}
        >
          <CardSmallImage card={data}></CardSmallImage>
          <SpoilerTag
            style={{
              position: "absolute",
              top: "1%",
              left: "1%",
            }}
            releaseTime={new Date(data.releaseAt)}
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`card_prefix:${data.id}`}
                original={data.prefix}
                originalProps={{
                  variant: "subtitle1",
                }}
                translatedProps={{
                  variant: "subtitle1",
                }}
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                {getCharaName(data.characterId)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LinkNoDecorationAlsoNoHover>
  );
};

export default GridView;
