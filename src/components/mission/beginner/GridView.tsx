import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import {
  IBeginnerMission,
  IResourceBoxInfo,
  ResourceBoxDetail,
} from "../../../types";
import { ContentTrans } from "../../subs/ContentTrans";
import CommonMaterialIcon from "../../subs/CommonMaterialIcon";
import { useCachedData } from "../../../utils";
import MaterialIcon from "../../subs/MaterialIcon";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "5%",
    backgroundSize: "contain",
  },
  card: {
    cursor: "pointer",
  },
  header: {},
  "grid-out": {
    padding: theme.spacing("1%", "2%"),
  },
}));

const GridView: React.FC<{ data?: IBeginnerMission }> = ({ data }) => {
  const classes = useStyles();
  // const { t } = useTranslation();
  // const { path } = useRouteMatch();

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
      <Card className={classes.card}>
        {/* <Skeleton variant="rect" className={classes.media}></Skeleton> */}
        <Grid container alignItems="center">
          <Grid item xs={8}>
            <CardContent>
              <Typography variant="subtitle1" className={classes.header}>
                <Skeleton variant="text" width="90%"></Skeleton>
              </Typography>
            </CardContent>
          </Grid>
          <Grid item xs={4} container justify="center">
            <Skeleton variant="rect" height="48px" width="48px"></Skeleton>
          </Grid>
        </Grid>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card className={classes.card}>
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
                      className: classes.header,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Grid>
          <Grid item xs={4} md={3} container spacing={1} justify="flex-end">
            {rewards.map((reward) =>
              reward.resourceType === "material" ? (
                <Grid item key={reward.resourceBoxId}>
                  <MaterialIcon
                    materialId={reward.resourceId!}
                    quantity={reward.resourceQuantity}
                  />
                </Grid>
              ) : (
                <Grid item key={reward.resourceBoxId}>
                  <CommonMaterialIcon
                    materialName={reward.resourceType}
                    quantity={reward.resourceQuantity}
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
