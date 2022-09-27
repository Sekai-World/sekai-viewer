import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import {
  IBeginnerMission,
  IResourceBoxInfo,
  ResourceBoxDetail,
} from "../../../types.d";
import { ContentTrans } from "../../../components/helpers/ContentTrans";
import CommonMaterialIcon from "../../../components/widgets/CommonMaterialIcon";
import { useCachedData } from "../../../utils";
import MaterialIcon from "../../../components/widgets/MaterialIcon";

const GridView: React.FC<{ data?: IBeginnerMission }> = ({ data }) => {
  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");

  const [rewards, setRewards] = useState<ResourceBoxDetail[]>([]);

  useEffect(() => {
    if (resourceBoxes && resourceBoxes.length && data) {
      setRewards(
        resourceBoxes.find(
          (rb) =>
            rb.resourceBoxPurpose === "mission_reward" &&
            data.rewards.some((reward) => reward.resourceBoxId === rb.id)
        )!.details
      );
    }
  }, [data, resourceBoxes]);

  if (!data) {
    // loading
    return (
      <Card>
        <Grid container alignItems="center">
          <Grid item xs={8}>
            <CardContent>
              <Typography variant="subtitle1">
                <Skeleton variant="text" width="90%"></Skeleton>
              </Typography>
            </CardContent>
          </Grid>
          <Grid item xs={4} container justifyContent="center">
            <Skeleton
              variant="rectangular"
              height="48px"
              width="48px"
            ></Skeleton>
          </Grid>
        </Grid>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card sx={{ cursor: "pointer" }}>
        <Grid container alignItems="center" wrap="nowrap">
          <Grid item xs={8} md={9}>
            <CardContent style={{ paddingBottom: "16px" }}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <ContentTrans
                    contentKey={`beginner_mission:${data.id}`}
                    original={data.sentence}
                    originalProps={{
                      variant: "subtitle1",
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
            container
            spacing={1}
            justifyContent="flex-end"
          >
            {rewards.map((reward) =>
              reward.resourceType === "material" ? (
                <Grid item key={reward.resourceBoxId} container>
                  <MaterialIcon
                    materialId={reward.resourceId!}
                    quantity={reward.resourceQuantity}
                    justify="center"
                  />
                </Grid>
              ) : (
                <Grid item key={reward.resourceBoxId}>
                  <CommonMaterialIcon
                    materialName={reward.resourceType}
                    quantity={reward.resourceQuantity}
                    justify="center"
                  />
                </Grid>
              )
            )}
          </Grid>
        </Grid>
      </Card>
    </Fragment>
  );
};

export default GridView;
