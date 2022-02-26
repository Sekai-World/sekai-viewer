import { Typography, Grid, Box, Paper } from "@mui/material";
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
import { cardRarityTypeToRarity } from "../../utils";

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
    [theme.breakpoints.down("md")]: {
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
    [theme.breakpoints.down("xl")]: { padding: "4% 4%" },
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
            justifyContent="space-between"
          >
            <Grid
              item
              xs={5}
              md={4}
              container
              direction="row"
              spacing={1}
              justifyContent="center"
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
        <Grid
          container
          alignItems="center"
          spacing={2}
          justifyContent="space-between"
        >
          <Grid
            item
            xs={5}
            md={4}
            container
            direction="row"
            spacing={1}
            justifyContent="center"
          >
            <Grid item xs={12} md={6} lg={4}>
              <CardThumb cardId={data.id} />
            </Grid>
            {(data.rarity || cardRarityTypeToRarity[data.cardRarityType!]) >=
            3 ? (
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
