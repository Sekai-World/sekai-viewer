import { Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useMemo, useState } from "react";
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
  {
    cardId: number;
    trained?: boolean;
    level?: number;
    masterRank?: number;
    power?: number;
  } & React.HTMLProps<HTMLDivElement>
> = ({ cardId, trained = false, onClick, style, level, masterRank, power }) => {
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
        {/* level */}
        {(level || power) && (
          <rect
            x="0"
            y="119"
            width="156"
            height="35"
            fill="black"
            fillOpacity="0.8"
          />
        )}
        {level && (
          <text
            x="15"
            y="144"
            width="156"
            height="30"
            fontSize="28"
            fontWeight="lighter"
            fill="white"
          >
            Lv.{level}
          </text>
        )}
        {power && (
          <text
            x="15"
            y="144"
            width="156"
            height="30"
            fontSize="28"
            fill="white"
          >
            {power}
          </text>
        )}
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
          x="1"
          y="1"
          width="35"
          height="35"
        />
        {/* rarity */}
        {Array.from({ length: card.rarity }).map((_, i) => (
          <image
            key={`card-rarity-${i}`}
            href={rarityIcon}
            x={i * 26 + 10}
            y={level || power ? "87" : "118"}
            width="28"
            height="28"
          />
        ))}
        {/* masterRank */}
        {masterRank && (
          <image
            href={cardMasterRankSmallMap[String(masterRank)]}
            x="97"
            y="93"
            width="60"
            height="60"
          ></image>
        )}
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
    level?: number;
    masterRank?: number;
    power?: number;
  } & React.HTMLProps<HTMLDivElement>
> = ({
  cardId,
  trained,
  defaultImage,
  level,
  masterRank,
  onClick,
  style,
  power,
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
  const randomNum = useMemo(() => Math.floor(100 * Math.random()), []);

  return card ? (
    <div className={classes.svg} onClick={onClick} style={style}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 520">
        <defs>
          <pattern
            width="330"
            height="520"
            id={`mediumThumb-${cardId}-${level}-${randomNum}`}
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
                y="450"
                width="330"
                height="70"
                fill="black"
                fillOpacity="0.8"
              />
              <text
                x="30"
                y="493"
                width="200"
                height="50"
                fontSize="50"
                fill="white"
              >
                {!!level && `Lv.${level}`}
                {!!power && `${power}`}
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
                  x={i * 50 + 16}
                  y="395"
                  width="50"
                  height="50"
                />
              ))}
              {/* masterRank */}
              {masterRank && (
                <image
                  href={cardMasterRankSmallMap[String(masterRank)]}
                  x="225"
                  y="415"
                  width="95"
                  height="95"
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
          fill={`url(#mediumThumb-${cardId}-${level}-${randomNum})`}
        />
      </svg>
    </div>
  ) : (
    skeleton
  );
};
