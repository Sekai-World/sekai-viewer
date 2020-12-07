import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { SettingContext } from "../../../context";
import {
  INormalMission,
  IResourceBoxInfo,
  ResourceBoxDetail,
} from "../../../types";
import { useAssetI18n } from "../../../utils/i18n";
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

const GridView: React.FC<{ data?: INormalMission }> = ({ data }) => {
  const classes = useStyles();
  // const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  // const { path } = useRouteMatch();
  const { contentTransMode } = useContext(SettingContext)!;

  const [resourceBoxes] = useCachedData<IResourceBoxInfo>("resourceBoxes");

  const [rewards, setRewards] = useState<ResourceBoxDetail[]>([]);

  useEffect(() => {
    if (resourceBoxes.length && data) {
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
        <Skeleton variant="rect" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
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
      <Card className={classes.card}>
        <Grid container alignItems="center">
          <Grid item xs={8}>
            <CardContent style={{ paddingBottom: "16px" }}>
              <Grid container direction="column" spacing={1}>
                <Grid item>
                  <ContentTrans
                    mode={contentTransMode}
                    contentKey={`normal_mission:${data.id}`}
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
          <Grid item xs={4}>
            <CardMedia
              className={classes.media}
              title={getTranslated(
                contentTransMode,
                `normal_mission:${data.id}`,
                data.sentence
              )}
            >
              {rewards.map((reward) =>
                reward.resourceType === "material" ? (
                  <MaterialIcon
                    materialId={reward.resourceId!}
                    quantity={reward.resourceQuantity}
                  />
                ) : (
                  <CommonMaterialIcon
                    materialName={reward.resourceType}
                    quantity={reward.resourceQuantity}
                  />
                )
              )}
            </CardMedia>
          </Grid>
        </Grid>
      </Card>
    </Fragment>
  );
};

export default GridView;
