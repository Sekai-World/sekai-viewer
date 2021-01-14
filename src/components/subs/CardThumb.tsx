import { Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { ICardInfo } from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { useSvgStyles } from "../../styles/svg";
import {
  attrIconMap,
  cardMasterRankSmallMap,
  cardThumbFrameMap,
  cardThumbMediumFrameMap,
} from "../../utils/resources";

export const CardThumb: React.FC<
  { cardId: number; trained?: boolean } & React.HTMLProps<HTMLDivElement>
> = ({ cardId, trained = false, onClick, style }) => {
  const skeleton = CardThumbSkeleton({});

  const classes = useSvgStyles();
  const [cards] = useCachedData<ICardInfo>("cards");
  const [card, setCard] = useState<ICardInfo>();

  useEffect(() => {
    if (cards) setCard(cards.find((elem) => elem.id === cardId));
  }, [cards, cardId]);

  const [cardThumbImg, setCardThumbImg] = useState<string>("");
  useEffect(() => {
    if (card) {
      getRemoteAssetURL(
        `thumbnail/chara_rip/${card.assetbundleName}_${
          trained ? "after_training" : "normal"
        }.webp`,
        setCardThumbImg,
        window.isChinaMainland
      );
    }
  }, [card, trained]);

  const rarityIcon = trained ? rarityAfterTraining : rarityNormal;

  return card ? (
    <div className={classes.svg} onClick={onClick} style={style}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 156">
        <image href={cardThumbImg} x="8" y="8" height="140" width="140" />
        {/* frame */}
        <image
          href={cardThumbFrameMap[String(card.rarity)]}
          x="0"
          y="0"
          height="156"
          width="156"
        />
        {/* attr */}
        <image
          href={attrIconMap[card.attr]}
          x="0"
          y="0"
          width="35"
          height="35"
        />
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
    </div>
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
          <CardThumb cardId={cardId} />
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

export const CardThumbMedium: React.FC<
  {
    cardId: number;
    trained: boolean;
    defaultImage?: string;
    cardLevel?: number;
    masterRank?: number;
  } & React.HTMLProps<HTMLDivElement>
> = ({
  cardId,
  trained,
  defaultImage,
  cardLevel,
  masterRank,
  onClick,
  style,
}) => {
  const skeleton = CardThumbSkeleton({});
  const classes = useSvgStyles();
  const [cards] = useCachedData<ICardInfo>("cards");
  const [card, setCard] = useState<ICardInfo>();

  useEffect(() => {
    if (cards) setCard(cards.find((elem) => elem.id === cardId));
  }, [cards, cardId]);

  const [cardThumbImg, setCardThumbImg] = useState<string>("");
  useEffect(() => {
    if (card) {
      getRemoteAssetURL(
        `character/member_cutout/${card.assetbundleName}_rip/${
          defaultImage
            ? defaultImage === "special_training"
              ? "after_training"
              : "normal"
            : trained
            ? "after_training"
            : "normal"
        }.webp`,
        setCardThumbImg
      );
    }
  }, [card, defaultImage, trained]);

  const rarityIcon = trained ? rarityAfterTraining : rarityNormal;

  return card ? (
    <div className={classes.svg} onClick={onClick} style={style}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 520">
        <defs>
          <pattern
            width="330"
            height="520"
            id={`mediumThumb-${cardId}`}
            patternUnits="userSpaceOnUse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 520">
              <image
                preserveAspectRatio="none"
                href={cardThumbImg}
                x="-135"
                y="0"
                height="576"
                width="620"
              />
              {/* level */}
              <rect
                x="0"
                y="470"
                width="330"
                height="50"
                fill="black"
                fillOpacity="0.8"
              />
              <text
                x="30"
                y="498"
                width="200"
                height="30"
                fontSize="30"
                fontWeight="lighter"
                fill="white"
              >
                Lv.{cardLevel}
              </text>
              {/* frame */}
              <image
                href={cardThumbMediumFrameMap[String(card.rarity)]}
                x="0"
                y="0"
                height="520"
                width="330"
              />
              {/* attr */}
              <image
                href={attrIconMap[card.attr]}
                x="9"
                y="12"
                width="50"
                height="50"
              />
              {/* rarity */}
              {Array.from({ length: card.rarity }).map((_, i) => (
                <image
                  key={`card-rarity-${i}`}
                  href={rarityIcon}
                  x={i * 33 + 16}
                  y="435"
                  width="33"
                  height="33"
                />
              ))}
              {/* masterRank */}
              {masterRank && (
                <image
                  href={cardMasterRankSmallMap[String(masterRank)]}
                  x="215"
                  y="405"
                  width="105"
                  height="105"
                ></image>
              )}
            </svg>
          </pattern>
        </defs>
        <rect
          x="4"
          y="4"
          rx="30"
          ry="30"
          width="322"
          height="512"
          fill={`url(#mediumThumb-${cardId})`}
        />
      </svg>
    </div>
  ) : (
    skeleton
  );
};
