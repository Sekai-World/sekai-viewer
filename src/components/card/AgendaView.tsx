import { Typography, Grid, makeStyles, Box, Paper } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types";
import { useCharaName } from "../../utils/i18n";
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
  agendaWrapper: {
    display: "block",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
    // [theme.breakpoints.only("md")]: {
    //   maxWidth: "600px",
    // },
    maxWidth: "80%",
    margin: "auto",
    cursor: "pointer",
  },
  agenda: {
    [theme.breakpoints.down("lg")]: { padding: "4% 4%" },
    [theme.breakpoints.up("md")]: { padding: "2% 2%" },
  },
}));

const AgendaView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <Box className={classes.agendaWrapper}>
        <Paper className={classes.agenda}>
          <Grid
            container
            alignItems="center"
            spacing={2}
            justify="space-between"
          >
            <Grid
              item
              xs={5}
              md={4}
              container
              direction="row"
              spacing={1}
              justify="center"
            >
              <Grid item xs={12} md={6}>
                <CardThumbSkeleton></CardThumbSkeleton>
              </Grid>
              <Grid item xs={12} md={6}>
                <CardThumbSkeleton></CardThumbSkeleton>
              </Grid>
            </Grid>
            <Grid item xs={6} md={7}>
              <Typography variant="body1">
                <Skeleton variant="text" width="70%"></Skeleton>
              </Typography>
              <Typography variant="body2">
                <Skeleton variant="text" width="30%"></Skeleton>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  return (
    <Link
      to={path + "/" + data.id}
      className={classes.agendaWrapper}
      style={{ textDecoration: "none" }}
    >
      <Paper className={classes.agenda}>
        <Grid container alignItems="center" spacing={2} justify="space-between">
          <Grid
            item
            xs={5}
            md={4}
            container
            direction="row"
            spacing={1}
            justify="center"
          >
            <Grid item xs={12} md={6} lg={4}>
              <CardThumb cardId={data.id} />
            </Grid>
            {data.rarity >= 3 && data.cardRarityType !== "rarity_birthday" ? (
              <Grid item xs={12} md={6} lg={4}>
                <CardThumb cardId={data.id} trained />
              </Grid>
            ) : null}
          </Grid>
          <Grid item xs={6} md={7}>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <SpoilerTag releaseTime={new Date(data.releaseAt)} />
              </Grid>
              <Grid item>
                <ContentTrans
                  contentKey={`card_prefix:${data.id}`}
                  original={data.prefix}
                  originalProps={{ variant: "body1" }}
                  translatedProps={{ variant: "body1" }}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2" color="textSecondary">
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

export default AgendaView;
