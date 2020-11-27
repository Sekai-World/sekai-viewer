import { Skeleton } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useSvgStyles } from "../../styles/svg";
import { ICardInfo } from "../../types";
import { getRemoteAssetURL, useCachedData, useRefState } from "../../utils";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import { attrIconMap, cardImageFrameMap } from "../../utils/resources";

export const CardImage: React.FC<{ id: number; trained?: boolean }> = ({
  id,
  trained = false,
}) => {
  const skeleton = CardImageSkeleton({});

  const classes = useSvgStyles();
  const [cards] = useCachedData<ICardInfo>("cards");
  const [card, setCard] = useState<ICardInfo>();

  const rarityIcon = trained ? rarityAfterTraining : rarityNormal;

  useEffect(() => {
    if (cards.length) setCard(cards.find((elem) => elem.id === id));
  }, [cards, id]);

  return card ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 576"
      className={classes.svg}
    >
      <image
        href={`${
          process.env.REACT_APP_ASSET_DOMAIN
        }/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_${
          trained ? "after_training" : "normal"
        }.webp`}
        x="0"
        y="-50"
        width="1024"
        height="630.5"
        preserveAspectRatio="xMidyMid slice"
      ></image>
      {/* frame */}
      <image
        href={cardImageFrameMap[card.rarity]}
        x="0"
        y="0"
        width="1024"
        height="576"
      ></image>
      {/* attr */}
      <image
        href={attrIconMap[card.attr]}
        x="920"
        y="16"
        width="88"
        height="88"
      />
      {/* rarity */}
      {Array.from({ length: card.rarity }).map((_, i) => (
        <image
          key={`card-rarity-${i}`}
          href={rarityIcon}
          x={i * 72 + 16}
          y="490"
          width="72"
          height="70"
        />
      ))}
    </svg>
  ) : (
    skeleton
  );
};

export const CardSmallImage: React.FC<{ card: ICardInfo }> = React.memo(
  ({ card }) => {
    const skeleton = CardImageSkeleton({});

    const classes = useSvgStyles();
    // const [cards] = useCachedData<ICardInfo>("cards");
    // const [card, setCard] = useState<ICardInfo>();

    const [hoveredArea, setHoveredArea] = useState<number>(0);
    const [imgLeftX, refImgLeftX, setImgLeftX] = useRefState<number>(-256);
    const [imgRightX, refImgRightX, setImgRightX] = useRefState<number>(512);

    const rarityIcon =
      card && card.rarity >= 3 ? rarityAfterTraining : rarityNormal;

    // useEffect(() => {
    //   if (cards.length) setCard(cards.find((elem) => elem.id === id));
    // }, [cards, id]);

    const [normalImg, setNormalImg] = useState<string>("");
    const [trainedImg, setTrainedImg] = useState<string>("");

    useEffect(() => {
      getRemoteAssetURL(
        `character/member_small/${card.assetbundleName}_rip/card_normal.webp`,
        setNormalImg
      );
      getRemoteAssetURL(
        `character/member_small/${card.assetbundleName}_rip/card_after_training.webp`,
        setTrainedImg
      );
    }, [card]);

    useEffect(() => {
      if (hoveredArea === 2) {
        const interval = setInterval(() => {
          if (refImgLeftX.current < 0) {
            setImgLeftX((x) => Math.floor(x + 10 * (-x / 256)));
            setImgRightX((x) => Math.floor(x + 10 * ((768 - x) / 256)));
          } else {
            clearInterval(interval);
          }
        }, 5);
        return () => clearInterval(interval);
      } else if (hoveredArea === 1) {
        const interval = setInterval(() => {
          if (refImgRightX.current > 256) {
            setImgLeftX((x) => Math.floor(x - 10 * ((512 + x) / 256)));
            setImgRightX((x) => Math.floor(x - 10 * ((x - 256) / 256)));
          } else {
            clearInterval(interval);
          }
        }, 5);
        return () => clearInterval(interval);
      } else if (hoveredArea === 0) {
        const interval = setInterval(() => {
          if (refImgLeftX.current > -256) {
            setImgLeftX((x) => Math.floor(x - 10 * ((256 + x) / 256)));
            setImgRightX((x) => Math.floor(x - 10 * ((x - 512) / 256)));
          } else if (refImgLeftX.current < -256) {
            setImgLeftX((x) => Math.floor(x + 10 * ((-256 - x) / 256)));
            setImgRightX((x) => Math.floor(x + 10 * ((512 - x) / 256)));
          } else {
            clearInterval(interval);
          }
        }, 5);
        return () => clearInterval(interval);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredArea]);

    return card ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 576"
        className={classes.svg}
        onMouseLeave={() => setHoveredArea(0)}
      >
        {card.rarity >= 3 ? (
          <Fragment>
            <svg
              x={imgRightX}
              y="0"
              width="768"
              height="576"
              preserveAspectRatio="xMaxYMid slice"
              viewBox="0 0 1024 576"
              onMouseOver={() => setHoveredArea(1)}
              style={{ pointerEvents: "all" }}
            >
              <image width="1024" height="576" href={trainedImg}></image>
            </svg>
            <svg
              x={imgLeftX}
              y="0"
              width="768"
              height="576"
              preserveAspectRatio="xMinYMid slice"
              viewBox="0 0 1024 576"
              onMouseOver={() => setHoveredArea(2)}
              style={{ pointerEvents: "all" }}
            >
              <image width="1024" height="576" href={normalImg}></image>
            </svg>
          </Fragment>
        ) : (
          <image
            href={normalImg}
            x="0"
            y="0"
            width="1024"
            height="576"
            preserveAspectRatio="xMidYMid slice"
          ></image>
        )}
        {/* frame */}
        <image
          href={cardImageFrameMap[card.rarity]}
          x="0"
          y="0"
          width="1024"
          height="576"
        ></image>
        {/* attr */}
        <image
          href={attrIconMap[card.attr]}
          x="924"
          y="12"
          width="88"
          height="88"
        />
        {/* rarity */}
        {Array.from({ length: card.rarity }).map((_, i) => (
          <image
            key={`card-rarity-${i}`}
            href={rarityIcon}
            x="16"
            y={490 - i * 62}
            width="72"
            height="70"
          />
        ))}
      </svg>
    ) : (
      skeleton
    );
  }
);

export const CardImageSkeleton: React.FC<{}> = () => {
  const classes = useSvgStyles();

  return <Skeleton variant="rect" className={classes.skeleton}></Skeleton>;
};
