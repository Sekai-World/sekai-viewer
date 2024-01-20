import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ICardInfo } from "../../types.d";
import {
  cardRarityTypeToRarity,
  getRemoteAssetURL,
  useCachedData,
  useCardType,
  useRefState,
} from "../../utils";

import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import rarityBirthday from "../../assets/rarity_birthday.png";
import { attrIconMap, cardImageFrameMap } from "../../utils/resources";
import SvgSkeleton from "../styled/SvgSkeleton";
import Svg from "../styled/Svg";

export const CardImage: React.FC<{ id: number; trained?: boolean }> = ({
  id,
  trained = false,
}) => {
  const [cards] = useCachedData<ICardInfo>("cards");
  const [card, setCard] = useState<ICardInfo>();
  const [cardImg, setCardImg] = useState<string>("");

  const { isBirthdayCard } = useCardType(card);

  const rarityIcon = useMemo(
    () =>
      isBirthdayCard
        ? rarityBirthday
        : trained
        ? rarityAfterTraining
        : rarityNormal,
    [isBirthdayCard, trained]
  );

  useEffect(() => {
    if (cards) setCard(cards.find((elem) => elem.id === id));
  }, [cards, id]);

  useEffect(() => {
    if (card)
      getRemoteAssetURL(
        `character/member/${card.assetbundleName}_rip/card_${
          trained ? "after_training" : "normal"
        }.webp`,
        setCardImg
      );
  }, [card, trained]);

  return card ? (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576">
      <image
        href={cardImg}
        x="0"
        y="-50"
        width="1024"
        height="630.5"
        preserveAspectRatio="xMidyMid slice"
      ></image>
      {/* frame */}
      <image
        href={cardImageFrameMap[cardRarityTypeToRarity[card.cardRarityType!]]}
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
      {Array.from({
        length: isBirthdayCard
          ? 1
          : cardRarityTypeToRarity[card.cardRarityType!],
      }).map((_, i) => (
        <image
          key={`card-rarity-${i}`}
          href={rarityIcon}
          x={i * 72 + 16}
          y="490"
          width="72"
          height="70"
        />
      ))}
    </Svg>
  ) : (
    <SvgSkeleton variant="rectangular" />
  );
};

export const CardSmallImage: React.FC<{ card: ICardInfo }> = React.memo(
  ({ card }) => {
    const [hoveredArea, setHoveredArea] = useState<number>(0);
    const [imgLeftX, refImgLeftX, setImgLeftX] = useRefState<number>(-256);
    const [imgRightX, refImgRightX, setImgRightX] = useRefState<number>(512);
    // const [requestId, refRequestId, setRequestId] = useRefState<number>(0);
    const [imgLeftWidth, refImgLeftWidth, setImgLeftWidth] =
      useRefState<number>(768);
    const [imgRightWidth, refImgRightWidth, setImgRightWidth] =
      useRefState<number>(768);
    const { isBirthdayCard, isTrainableCard } = useCardType(card);

    const svgElement = useRef<SVGSVGElement>(null);

    const rarityIcon = useMemo(
      () =>
        isBirthdayCard
          ? rarityBirthday
          : isTrainableCard
          ? rarityAfterTraining
          : rarityNormal,
      [isBirthdayCard, isTrainableCard]
    );
    const animationDuration = 500;

    // useEffect(() => {
    //   if (cards.length) setCard(cards.find((elem) => elem.id === id));
    // }, [cards, id]);

    const [normalImg, setNormalImg] = useState<string>("");
    const [trainedImg, setTrainedImg] = useState<string>("");

    useEffect(() => {
      getRemoteAssetURL(
        `character/member_small/${card.assetbundleName}_rip/card_normal.webp`,
        setNormalImg,
        "minio"
      );
      getRemoteAssetURL(
        `character/member_small/${card.assetbundleName}_rip/card_after_training.webp`,
        setTrainedImg,
        "minio"
      );
    }, [card]);

    useLayoutEffect(() => {
      if (hoveredArea === 2) {
        const start = performance.now();

        const currLeftX = refImgLeftX.current;
        const leftXDistance = 0 - refImgLeftX.current;
        const currLeftWidth = refImgLeftWidth.current;
        const leftWidthDistance = 940 - currLeftWidth;

        const currRightX = refImgRightX.current;
        const rightXDistance = 940 - refImgRightX.current;
        const currRightWidth = refImgRightWidth.current;
        const rightWidthDistance = 768 - currRightWidth;
        let requestId = requestAnimationFrame(function animation(time: number) {
          let timeFraction = (time - start) / animationDuration;
          if (timeFraction > 1) timeFraction = 1;

          setImgLeftX(Math.floor(currLeftX + leftXDistance * timeFraction));
          setImgRightX(Math.floor(currRightX + rightXDistance * timeFraction));
          setImgLeftWidth(
            Math.floor(currLeftWidth + leftWidthDistance * timeFraction)
          );
          setImgRightWidth(
            Math.floor(currRightWidth + rightWidthDistance * timeFraction)
          );

          if (timeFraction < 1) {
            requestId = requestAnimationFrame(animation);
          } else {
            cancelAnimationFrame(requestId);
          }
        });
        return () => cancelAnimationFrame(requestId);
      } else if (hoveredArea === 1) {
        const start = performance.now();

        const currLeftX = refImgLeftX.current;
        const leftXDistance = -684 - refImgLeftX.current;
        const currLeftWidth = refImgLeftWidth.current;
        const leftWidthDistance = 768 - currLeftWidth;

        const currRightX = refImgRightX.current;
        const rightXDistance = 84 - refImgRightX.current;
        const currRightWidth = refImgRightWidth.current;
        const rightWidthDistance = 940 - currRightWidth;
        let requestId = requestAnimationFrame(function animation(time: number) {
          let timeFraction = (time - start) / animationDuration;
          if (timeFraction > 1) timeFraction = 1;

          setImgLeftX(Math.floor(currLeftX + leftXDistance * timeFraction));
          setImgRightX(Math.floor(currRightX + rightXDistance * timeFraction));
          setImgLeftWidth(
            Math.floor(currLeftWidth + leftWidthDistance * timeFraction)
          );
          setImgRightWidth(
            Math.floor(currRightWidth + rightWidthDistance * timeFraction)
          );

          if (timeFraction < 1) {
            requestId = requestAnimationFrame(animation);
          } else {
            cancelAnimationFrame(requestId);
          }
        });
        return () => cancelAnimationFrame(requestId);
      } else if (hoveredArea === 0) {
        const start = performance.now();

        const currLeftX = refImgLeftX.current;
        const leftXDistance = -256 - refImgLeftX.current;
        const currLeftWidth = refImgLeftWidth.current;
        const leftWidthDistance = 768 - currLeftWidth;

        const currRightX = refImgRightX.current;
        const rightXDistance = 512 - refImgRightX.current;
        const currRightWidth = refImgRightWidth.current;
        const rightWidthDistance = 768 - currRightWidth;
        let requestId = requestAnimationFrame(function animation(time: number) {
          let timeFraction = (time - start) / animationDuration;
          if (timeFraction > 1) timeFraction = 1;

          setImgLeftX(Math.floor(currLeftX + leftXDistance * timeFraction));
          setImgRightX(Math.floor(currRightX + rightXDistance * timeFraction));
          setImgLeftWidth(
            Math.floor(currLeftWidth + leftWidthDistance * timeFraction)
          );
          setImgRightWidth(
            Math.floor(currRightWidth + rightWidthDistance * timeFraction)
          );

          if (timeFraction < 1) {
            requestId = requestAnimationFrame(animation);
          } else {
            cancelAnimationFrame(requestId);
          }
        });
        return () => cancelAnimationFrame(requestId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hoveredArea]);

    const handleMoseOver = useCallback(
      (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (!svgElement.current || isBirthdayCard) {
          return;
        }
        const rect = svgElement.current.getBoundingClientRect();
        if (e.clientX - rect.left < rect.width / 2) {
          setHoveredArea(2);
        } else if (e.clientX - rect.left > rect.width / 2) {
          setHoveredArea(1);
        }
      },
      [isBirthdayCard]
    );

    return card ? (
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 576"
        ref={svgElement}
        onMouseMove={handleMoseOver}
        onMouseLeave={() => setHoveredArea(0)}
      >
        {isTrainableCard && !isBirthdayCard ? (
          <Fragment>
            <svg
              x={imgLeftX}
              y="0"
              width={imgLeftWidth}
              height="576"
              preserveAspectRatio="xMinYMid slice"
              viewBox="0 0 1024 576"
              // style={{ pointerEvents: "all" }}
            >
              <image width="1024" height="576" href={normalImg}></image>
            </svg>
            <svg
              x={imgRightX}
              y="0"
              width={imgRightWidth}
              height="576"
              preserveAspectRatio="xMaxYMid slice"
              viewBox="0 0 1024 576"
              // style={{ pointerEvents: "all" }}
            >
              <image width="1024" height="576" href={trainedImg}></image>
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
          href={cardImageFrameMap[cardRarityTypeToRarity[card.cardRarityType!]]}
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
        {Array.from({
          length: isBirthdayCard
            ? 1
            : cardRarityTypeToRarity[card.cardRarityType!],
        }).map((_, i) => (
          <image
            key={`card-rarity-${i}`}
            href={rarityIcon}
            x="16"
            y={490 - i * 62}
            width="72"
            height="70"
          />
        ))}
      </Svg>
    ) : (
      <SvgSkeleton variant="rectangular" />
    );
  }
);
