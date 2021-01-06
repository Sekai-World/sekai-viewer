import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useContext } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { SettingContext } from "../../context";
import { ICardInfo } from "../../types";
import { useCharaName } from "../../utils";
import { useAssetI18n } from "../../utils/i18n";
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
  const { contentTransMode } = useContext(SettingContext)!;
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { getTranslated } = useAssetI18n();
  const getCharaName = useCharaName(contentTransMode);

  if (!data) {
    // loading
    return (
      <Card className={classes.card}>
        <Skeleton variant="rect" className={classes.media}></Skeleton>
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
          title={getTranslated(
            contentTransMode,
            `card_prefix:${data.id}`,
            data.prefix
          )}
        >
          <CardSmallImage card={data}></CardSmallImage>
        </CardMedia>
        <CardContent style={{ paddingBottom: "16px" }}>
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <SpoilerTag releaseTime={new Date(data.releaseAt)} />
            </Grid>
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
