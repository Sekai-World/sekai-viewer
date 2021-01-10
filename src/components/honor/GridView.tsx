import { Card, CardContent, Typography, Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment } from "react";
import { IHonorInfo } from "../../types";
import { ContentTrans } from "../subs/ContentTrans";
import DegreeImage from "../subs/DegreeImage";

interface Props {
  data?: IHonorInfo;
}

const GridView = ({ data }: Props) => {
  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton variant="rect"></Skeleton>
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
      <Card style={{ cursor: "pointer" }}>
        <CardContent>
          <DegreeImage honorId={data.id} type="mission_reward" />
        </CardContent>
        <CardContent>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`honor_name:${data.name}`}
                original={data.name}
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
