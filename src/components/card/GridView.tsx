import { Card, CardContent, Typography, CardMedia, Grid } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Skeleton } from "@mui/material";
import React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { ICardInfo } from "../../types";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import { CardSmallImage } from "../subs/CardImage";
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
}));

const GridView: React.FC<{ data?: ICardInfo }> = ({ data }) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName();

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rectangular" className={classes.media}></Skeleton>
        <CardContent>
          <Typography variant="subtitle1" className={classes.subheader}>
            <Skeleton variant="text" width="90%"></Skeleton>
          </Typography>
          <Typography variant="body2" className={classes.subheader}>
            <Skeleton variant="text" width="30%"></Skeleton>
          </Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <Link to={path + "/" + data.id} style={{ textDecoration: "none" }}>
      <Card className={classes.card}>
        <CardMedia
          title={getTranslated(`card_prefix:${data.id}`, data.prefix)}
          style={{
            position: "relative",
          }}
        >
          <CardSmallImage card={data}></CardSmallImage>
          <SpoilerTag
            style={{
              position: "absolute",
              top: "1%",
              left: "1%",
            }}
            releaseTime={new Date(data.releaseAt)}
          />
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <ContentTrans
                contentKey={`card_prefix:${data.id}`}
                original={data.prefix}
                originalProps={{
                  variant: "subtitle1",
                  className: classes.subheader,
                }}
                translatedProps={{
                  variant: "subtitle1",
                  className: classes.subheader,
                }}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="body2"
                className={classes.subheader}
                color="textSecondary"
              >
                {getCharaName(data.characterId)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GridView;
