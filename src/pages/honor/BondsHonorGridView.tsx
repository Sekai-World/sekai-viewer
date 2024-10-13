import { Card, CardContent, Typography, Grid } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { Fragment } from "react";
import { IBondsHonor, IBondsHonorWord } from "../../types";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import BondsDegreeImage from "../../components/widgets/BondsDegreeImage";

export interface BondsHonorData {
  id: number;
  bond: IBondsHonor;
  word?: IBondsHonorWord;
}

interface Props {
  data?: BondsHonorData;
}

const BondsHonorGridView = ({ data }: Props) => {
  if (!data) {
    // loading
    return (
      <Card>
        <Skeleton variant="rectangular"></Skeleton>
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
          <BondsDegreeImage
            bondsHonorWordId={data.word?.id}
            honorId={data.bond.id}
            honorLevel={data.bond.levels[0].level}
            type="bonds"
            viewType="normal"
          />
        </CardContent>
        <CardContent>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`honor_name:${data.bond.name}`}
                original={data.bond.name}
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

export default BondsHonorGridView;
