import { Typography, Grid, Paper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types.d";
import { useCharaName } from "../../utils/i18n";
import {
  CardThumbSkeleton,
  CardThumb,
} from "../../components/widgets/CardThumb";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";

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
    padding: theme.spacing(1.5),
    cursor: "pointer",
  },
}));

const ComfyView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <Paper className={classes.comfy}>
        <Grid
          container
          direction="column"
          alignItems="center"
          columnSpacing={2}
          rowSpacing={1}
          justifyContent="space-between"
        >
          <Grid
            item
            container
            direction="row"
            spacing={1}
            justifyContent="center"
          >
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
          justifyContent="space-between"
        >
          <Grid
            item
            container
            direction="row"
            spacing={1}
            justifyContent="center"
          >
            <Grid item xs={4}>
              <CardThumb cardId={data.id} />
            </Grid>
            {data.rarity >= 3 && data.cardRarityType !== "rarity_birthday" ? (
              <Grid item xs={4}>
                <CardThumb cardId={data.id} trained />
              </Grid>
            ) : null}
          </Grid>
          <Grid item style={{ width: "100%" }}>
            <Grid container direction="column" rowSpacing={0.5}>
              <Grid item>
                <Grid container justifyContent="center">
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
