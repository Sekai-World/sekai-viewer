import { Typography, Grid } from "@mui/material";
import { Skeleton } from "@mui/material";
import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types.d";
import { useCharaName } from "../../utils/i18n";
import { CardThumb } from "../../components/widgets/CardThumb";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";
import { cardRarityTypeToRarity } from "../../utils";
import SvgSkeleton from "../../components/styled/SvgSkeleton";
import AgendaBox from "../../components/styled/AgendaBox";
import AgendaPaper from "../../components/styled/AgendaPaper";

const AgendaView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const { path } = useRouteMatch();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <AgendaBox>
        <AgendaPaper>
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
                <SvgSkeleton variant="rectangular" />
              </Grid>
              <Grid item xs={12} md={6}>
                <SvgSkeleton variant="rectangular" />
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
        </AgendaPaper>
      </AgendaBox>
    );
  }
  return (
    <Link
      to={path + "/" + data.id}
      component={AgendaBox}
      style={{ textDecoration: "none" }}
    >
      <AgendaPaper>
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
      </AgendaPaper>
    </Link>
  );
};

export default AgendaView;
