import { Typography, Grid, Paper } from "@mui/material";
import { Skeleton } from "@mui/material";
import React from "react";
import { useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types.d";
import { useCharaName } from "../../utils/i18n";
import { CardThumb } from "../../components/widgets/CardThumb";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import SpoilerTag from "../../components/widgets/SpoilerTag";
import { cardRarityTypeToRarity } from "../../utils";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import SvgSkeleton from "../../components/styled/SvgSkeleton";

const ComfyViewSkeleton = () => (
  <Paper
    sx={(theme) => ({
      padding: theme.spacing(1.5),
      cursor: "pointer",
    })}
  >
    <Grid
      container
      direction="column"
      alignItems="center"
      columnSpacing={2}
      rowSpacing={1}
      justifyContent="space-between"
    >
      <Grid item container direction="row" spacing={1} justifyContent="center">
        <Grid item xs={4}>
          <SvgSkeleton variant="rectangular" />
        </Grid>
        <Grid item xs={4}>
          <SvgSkeleton variant="rectangular" />
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

const ComfyView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const { path } = useRouteMatch();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return <ComfyViewSkeleton />;
  }
  return (
    <LinkNoDecoration to={path + "/" + data.id}>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(1.5),
          cursor: "pointer",
        })}
      >
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
            {(data.rarity || cardRarityTypeToRarity[data.cardRarityType!]) >=
            3 ? (
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
    </LinkNoDecoration>
  );
};

export default ComfyView;
