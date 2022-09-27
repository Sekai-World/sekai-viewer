import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { Fragment } from "react";
import { IHonorMission } from "../../../types.d";
import { useAssetI18n } from "../../../utils/i18n";
import { ContentTrans } from "../../../components/helpers/ContentTrans";
import DegreeImage from "../../../components/widgets/DegreeImage";

const GridView: React.FC<{ data?: IHonorMission }> = ({ data }) => {
  const { getTranslated } = useAssetI18n();

  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton
          variant="rectangular"
          sx={{
            paddingTop: "5%",
            backgroundSize: "contain",
          }}
        ></Skeleton>
        <CardContent>
          <Typography variant="subtitle1">
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2">
            <Skeleton variant="text" width="40%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card sx={{ cursor: "pointer" }}>
        <CardMedia
          title={getTranslated(`honor_mission:${data.id}`, data.sentence)}
          sx={{
            paddingTop: "5%",
            backgroundSize: "contain",
          }}
        >
          <DegreeImage
            resourceBoxId={data.rewards[0].resourceBoxId}
            type="mission_reward"
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`honor_mission:${data.id}`}
                original={data.sentence}
                originalProps={{
                  variant: "subtitle1",
                }}
                translatedProps={{
                  variant: "subtitle1",
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default GridView;
