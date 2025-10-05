import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ICardInfo } from "../../types.d";
import {
  cardRarityTypeToRarity,
  getRemoteAssetURL,
  useCachedData,
  useCardType,
  useIntersectionObserver,
} from "../../utils";
import styles from "./CardImage.module.css";

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

  // Lazy loading setup
  const [containerRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

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
    // 只有当组件可见且有卡片数据时才加载图片
    if (card && isVisible)
      getRemoteAssetURL(
        `character/member/${card.assetbundleName}/card_${
          trained ? "after_training" : "normal"
        }.webp`,
        setCardImg
      );
  }, [card, trained, isVisible]);

  return card ? (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      {!isVisible ? (
        <SvgSkeleton variant="rectangular" />
      ) : (
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
            href={
              cardImageFrameMap[cardRarityTypeToRarity[card.cardRarityType!]]
            }
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
      )}
    </div>
  ) : (
    <SvgSkeleton variant="rectangular" />
  );
};

export const CardSmallImage: React.FC<{ card: ICardInfo }> = React.memo(
  function CardSmallImage({ card }: { card: ICardInfo }) {
    const { isBirthdayCard, isTrainableCard, isTrainedOnlyCard } =
      useCardType(card);

    // Lazy loading setup
    const [containerRef, isVisible] = useIntersectionObserver({
      threshold: 0.1, // 当10%的元素可见时开始加载
      rootMargin: "50px", // 提前50px开始加载
    });

    const rarityIcon = useMemo(
      () =>
        isBirthdayCard
          ? rarityBirthday
          : isTrainableCard
            ? rarityAfterTraining
            : rarityNormal,
      [isBirthdayCard, isTrainableCard]
    );

    const [normalImg, setNormalImg] = useState<string>("");
    const [trainedImg, setTrainedImg] = useState<string>("");

    useEffect(() => {
      // 只有当组件可见时才加载图片
      if (!isVisible) return;

      if (!isTrainedOnlyCard) {
        getRemoteAssetURL(
          `character/member_small/${card.assetbundleName}/card_normal.webp`,
          setNormalImg,
          "minio"
        );
      }
      getRemoteAssetURL(
        `character/member_small/${card.assetbundleName}/card_after_training.webp`,
        setTrainedImg,
        "minio"
      );
    }, [card, isTrainedOnlyCard, isVisible]);

    return card ? (
      <div ref={containerRef as React.RefObject<HTMLDivElement>}>
        {!isVisible ? (
          // 显示骨架屏直到图片需要加载
          <SvgSkeleton variant="rectangular" />
        ) : (
          <div className={styles.cardContainer}>
            {/* 悬浮区域 - 必须在最前面 */}
            {isTrainableCard && !isBirthdayCard && !isTrainedOnlyCard && (
              <Fragment>
                <div
                  className={`${styles.hoverArea} ${styles.hoverAreaLeft}`}
                />
                <div
                  className={`${styles.hoverArea} ${styles.hoverAreaRight}`}
                />
              </Fragment>
            )}

            {/* 图片容器 */}
            <div className={styles.cardContent}>
              <div className={styles.imageContainer}>
                {isTrainedOnlyCard ? (
                  // 只有训练后图片
                  <img
                    src={trainedImg}
                    alt="Card"
                    className={styles.cardImage}
                  />
                ) : isTrainableCard && !isBirthdayCard ? (
                  // 双图片模式
                  <Fragment>
                    <div className={styles.leftImageWrapper}>
                      <img
                        src={normalImg}
                        alt="Card Normal"
                        className={`${styles.cardImage} ${styles.leftImage}`}
                      />
                    </div>
                    <div className={styles.rightImageWrapper}>
                      <img
                        src={trainedImg}
                        alt="Card Trained"
                        className={`${styles.cardImage} ${styles.rightImage}`}
                      />
                    </div>
                  </Fragment>
                ) : (
                  // 只有普通图片
                  <img
                    src={normalImg}
                    alt="Card"
                    className={styles.cardImage}
                  />
                )}
              </div>

              {/* 覆盖层元素 */}
              <div className={styles.overlayContainer}>
                {/* 卡片边框 */}
                <img
                  src={
                    cardImageFrameMap[
                      cardRarityTypeToRarity[card.cardRarityType!]
                    ]
                  }
                  alt="Frame"
                  className={styles.frameOverlay}
                />

                {/* 属性图标 */}
                <img
                  src={attrIconMap[card.attr]}
                  alt="Attribute"
                  className={styles.attrIcon}
                />

                {/* 稀有度星星 */}
                <div className={styles.rarityContainer}>
                  {Array.from({
                    length: isBirthdayCard
                      ? 1
                      : cardRarityTypeToRarity[card.cardRarityType!],
                  }).map((_, i) => (
                    <img
                      key={`card-rarity-${i}`}
                      src={rarityIcon}
                      alt="Rarity"
                      className={styles.rarityIcon}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      <SvgSkeleton variant="rectangular" />
    );
  }
);
