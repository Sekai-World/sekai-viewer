import { Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { ICardInfo } from "../../types";
import { useCachedData } from "../../utils";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { useSvgStyles } from "../../styles/svg";
import { attrIconMap, cardThumbFrameMap } from "../../utils/resources";

export const CardThumb: React.FC<{ id: number; trained?: boolean }> = ({
  id,
  trained = false,
}) => {
  const skeleton = CardThumbSkeleton({});

  const classes = useSvgStyles();
  const [cards] = useCachedData<ICardInfo>("cards");
  const [card, setCard] = useState<ICardInfo>();

  useEffect(() => {
    if (cards.length) setCard(cards.find((elem) => elem.id === id));
  }, [cards, id]);

  const rarityIcon = trained ? rarityAfterTraining : rarityNormal;

  return card ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 156 156"
      className={classes.svg}
    >
      <image
        href={`${
          process.env.REACT_APP_ASSET_DOMAIN
        }/file/sekai-assets/thumbnail/chara_rip/${card.assetbundleName}_${
          trained ? "after_training" : "normal"
        }.webp`}
        x="8"
        y="8"
        height="140"
        width="140"
      />
      {/* frame */}
      <image
        href={cardThumbFrameMap[String(card.rarity)]}
        x="0"
        y="0"
        height="156"
        width="156"
      />
      {/* attr */}
      <image href={attrIconMap[card.attr]} x="0" y="0" width="35" height="35" />
      {/* rarity */}
      {Array.from({ length: card.rarity }).map((_, i) => (
        <image
          key={`card-rarity-${i}`}
          href={rarityIcon}
          x={i * 22 + 8}
          y="124"
          width="22"
          height="22"
        />
      ))}
    </svg>
  ) : (
    skeleton
  );
};

export const CardThumbSkeleton: React.FC<{}> = () => {
  const classes = useSvgStyles();

  return <Skeleton variant="rect" className={classes.skeleton}></Skeleton>;
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
        <Grid key={id} item xs={4} sm={2}>
          <CardThumb id={cardId} />
        </Grid>
      ))}
    </Grid>
  );
};

export const CardThumbsSkeleton: React.FC<{ length: number }> = ({
  length = 1,
}) => {
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
