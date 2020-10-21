import { Box, Grid, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { ICardInfo } from "../../types";
import { useCachedData } from "../../utils";

import cardFrameS1 from "../../assets/frame/cardFrame_S_1.png";
import cardFrameS2 from "../../assets/frame/cardFrame_S_2.png";
import cardFrameS3 from "../../assets/frame/cardFrame_S_3.png";
import cardFrameS4 from "../../assets/frame/cardFrame_S_4.png";

import IconAttrCool from "../../assets/icon_attribute_cool.png";
import IconAttrCute from "../../assets/icon_attribute_cute.png";
import IconAttrHappy from "../../assets/icon_attribute_happy.png";
import IconAttrMyster from "../../assets/icon_attribute_mysterious.png";
import IconAttrPure from "../../assets/icon_attribute_pure.png";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";

const useStyles = makeStyles((theme) => ({
  img: {
    width: "100%",
    height: "100%",
  },
  frame: {
    width: "100%",
    height: "97%",
  },
  attr: {
    width: "25%",
    height: "25%",
  },
  "rarity-0": {
    width: "15%",
    height: "15%",
    left: "5%",
  },
  "rarity-1": {
    width: "15%",
    height: "15%",
    left: "20%",
  },
  "rarity-2": {
    width: "15%",
    height: "15%",
    left: "35%",
  },
  "rarity-3": {
    width: "15%",
    height: "15%",
    left: "50%",
  },
  skeleton: {
    width: "100%",
    paddingTop: "100%",
  },
}));

const cardFrameRarity: { [key: string]: string } = {
  1: cardFrameS1,
  2: cardFrameS2,
  3: cardFrameS3,
  4: cardFrameS4,
};

const attrIconMap: { [key: string]: string } = {
  cool: IconAttrCool,
  cute: IconAttrCute,
  happy: IconAttrHappy,
  mysterious: IconAttrMyster,
  pure: IconAttrPure,
};

export const CardThumb: React.FC<{ id: number; trained?: boolean }> = ({
  id,
  trained,
}) => {
  const classes = useStyles();
  const [cards] = useCachedData<ICardInfo>("cards");
  trained = trained || false;
  const rarityIcon = trained ? rarityAfterTraining : rarityNormal;
  const [card, setCard] = useState<ICardInfo>();

  useEffect(() => {
    if (cards.length) setCard(cards.find((elem) => elem.id === id));
  }, [cards, id]);

  return card ? (
    <Box position="relative">
      <img
        src={`https://sekai-res.dnaroma.eu/file/sekai-assets/thumbnail/chara_rip/${
          card.assetbundleName
        }_${trained ? "after_training" : "normal"}.webp`}
        alt={card.prefix}
        className={classes.img}
        style={{ paddingTop: "2%", paddingLeft: "2%" }}
      />
      <img
        className={classes.frame}
        src={cardFrameRarity[String(card.rarity)]}
        alt="card frame"
        style={{ position: "absolute", zIndex: 999, top: "0px", left: "0px" }}
      />
      <img
        className={classes.attr}
        src={attrIconMap[card.attr]}
        alt="card attr"
        style={{ position: "absolute", zIndex: 999, top: "0px", left: "0px" }}
      />
      {Array.from({ length: card.rarity }).map((v, idx) => (
        <img
          key={`card-rarity-${idx}`}
          className={
            classes[
              `rarity-${idx}` as
                | "rarity-0"
                | "rarity-1"
                | "rarity-2"
                | "rarity-3"
            ]
          }
          src={rarityIcon}
          alt={`card rarity ${idx}`}
          style={{ position: "absolute", zIndex: 999, bottom: "7%" }}
        />
      ))}
    </Box>
  ) : null;
};

export const CardThumbSkeleton: React.FC<{}> = () => {
  const classes = useStyles();

  return (
    <Skeleton variant="rect" className={classes.skeleton}></Skeleton>
  );
};

export const CardThumbs: React.FC<{ cardIds: number[] }> = ({ cardIds }) => {
  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justify="center"
      alignItems="center"
    >
      {cardIds.map((cardId, id) => (
        <Grid key={id} item xs={4} md={2}>
          <CardThumb id={cardId} />
        </Grid>
      ))}
    </Grid>
  );
};

export const CardThumbsSkeleton: React.FC<{ length: number }> = ({ length = 1 }) => {
  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justify="center"
      alignItems="center"
    >
      {Array.from({ length }).map((_, id) => (
        <Grid key={id} item xs={4} md={2}>
          <CardThumbSkeleton></CardThumbSkeleton>
        </Grid>
      ))}
    </Grid>
  );
};
