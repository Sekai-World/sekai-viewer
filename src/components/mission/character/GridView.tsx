import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext } from "react";
import { SettingContext } from "../../../context";
import { ICharacterMission } from "../../../types";
import { ContentTrans } from "../../subs/ContentTrans";

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

const GridView: React.FC<{ data?: ICharacterMission }> = ({ data }) => {
  const classes = useStyles();
  const { contentTransMode } = useContext(SettingContext)!;

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        {/* <Skeleton variant="rect" className={classes.media}></Skeleton> */}
        <CardContent>
          <Typography variant="subtitle1" className={classes.header}>
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card className={classes.card}>
        <Grid container alignItems="center">
          <Grid item xs={12}>
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
        </Grid>
      </Card>
    </Fragment>
  );
};

export default GridView;
