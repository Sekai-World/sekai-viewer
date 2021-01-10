import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext } from "react";
// import { useTranslation } from "react-i18next";
// import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../../context";
import { IHonorMission } from "../../../types";
import { useAssetI18n } from "../../../utils/i18n";
import { ContentTrans } from "../../subs/ContentTrans";
import DegreeImage from "../../subs/DegreeImage";

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

const GridView: React.FC<{ data?: IHonorMission }> = ({ data }) => {
  const classes = useStyles();
  // const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  // const { path } = useRouteMatch();
  const { contentTransMode } = useContext(SettingContext)!;

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
        <CardMedia
          className={classes.media}
          title={getTranslated(
            contentTransMode,
            `honor_mission:${data.id}`,
            data.sentence
          )}
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
