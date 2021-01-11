import { Typography, Grid, makeStyles, Paper } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { ICardInfo } from "../../types";
import { useCharaName } from "../../utils";
import { CardThumbSkeleton, CardThumb } from "../subs/CardThumb";
import { ContentTrans } from "../subs/ContentTrans";
import SpoilerTag from "../subs/SpoilerTag";

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
  },
  card: {
    // margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  subheader: {
    // whiteSpace: "nowrap",
    // overflow: "hidden",
    // textOverflow: "ellipsis",
  },
  comfy: {
    padding: "6% 4%",
    cursor: "pointer",
  },
}));

const ComfyView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const { contentTransMode } = useContext(SettingContext)!;
  const classes = useStyles();
  const { path } = useRouteMatch();
  const getCharaName = useCharaName(contentTransMode);

  if (!data) {
    // loading
    return (
      <Paper className={classes.comfy}>
        <Grid
          container
          direction="column"
          alignItems="center"
          spacing={2}
          justify="space-between"
        >
          <Grid item container direction="row" spacing={1} justify="center">
            <Grid item xs={4}>
              <CardThumbSkeleton></CardThumbSkeleton>
            </Grid>
            <Grid item xs={4}>
              <CardThumbSkeleton></CardThumbSkeleton>
            </Grid>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              <Skeleton
                variant="text"
                width="70%"
                style={{ margin: "0 auto" }}
              ></Skeleton>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2">
              <Skeleton
                variant="text"
                width="40%"
                style={{ margin: "0 auto" }}
              ></Skeleton>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  }
  return (
    <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
      <Paper className={classes.comfy}>
        <Grid
          container
          direction="column"
          alignItems="center"
          spacing={2}
          justify="space-between"
        >
          <Grid item container direction="row" spacing={1} justify="center">
            <Grid item xs={4}>
              <CardThumb cardId={data.id} />
            </Grid>
            {data.rarity >= 3 ? (
              <Grid item xs={4}>
                <CardThumb cardId={data.id} trained />
              </Grid>
            ) : null}
          </Grid>
          <Grid item style={{ width: "100%" }}>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <Grid container justify="center">
                  <SpoilerTag releaseTime={new Date(data.releaseAt)} />
                </Grid>
              </Grid>
              <Grid item>
                <ContentTrans
                  contentKey={`card_prefix:${data.id}`}
                  original={data.prefix}
                  originalProps={{
                    variant: "body1",
                    align: "center",
                  }}
                  translatedProps={{
                    variant: "body1",
                    align: "center",
                  }}
                />
              </Grid>
              <Grid item>
                <Typography
                  variant="body2"
                  align="center"
                  color="textSecondary"
                >
                  {getCharaName(data.characterId)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Link>
  );
};

export default ComfyView;
