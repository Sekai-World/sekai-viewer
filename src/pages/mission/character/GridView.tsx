import { Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { Skeleton } from "@mui/material";
import React, { Fragment } from "react";
import { ICharacterMission } from "../../../types.d";
import { useCharaName } from "../../../utils/i18n";
import { ContentTrans } from "../../../components/helpers/ContentTrans";

const GridView: React.FC<{ data?: ICharacterMission }> = ({ data }) => {
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle1">
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Fragment>
      <Card
        sx={{
          cursor: "pointer",
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <CardContent style={{ paddingBottom: "16px" }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={2} container justifyContent="center">
                  <Chip label={data.seq} />
                </Grid>
                <Grid item xs={10}>
                  <ContentTrans
                    contentKey={`character_mission:${data.characterMissionType}`}
                    original={data.sentence}
                    originalProps={{
                      variant: "subtitle1",
                    }}
                    translatedProps={{
                      variant: "subtitle1",
                    }}
                    assetTOptions={{
                      name: getCharaName(data.characterId),
                      count: data.requirement,
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
