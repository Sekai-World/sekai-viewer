import {
  Card,
  CardContent,
  Chip,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useContext } from "react";
import { SettingContext } from "../../../context";
import { ICharacterMission } from "../../../types";
import { useCharaName } from "../../../utils";
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
  const getCharaName = useCharaName(contentTransMode);

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
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={2} container justify="center">
                  <Chip label={data.seq} />
                </Grid>
                <Grid item xs={10}>
                  <ContentTrans
                    contentKey={`character_mission:${data.characterMissionType}`}
                    original={data.sentence}
                    originalProps={{
                      variant: "subtitle1",
                      className: classes.header,
                    }}
                    translatedProps={{
                      variant: "subtitle1",
                      className: classes.header,
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
