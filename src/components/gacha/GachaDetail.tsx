import {
  Button,
  Card,
  CardMedia,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import {
  GachaDetail,
  GachaStatistic,
  ICardInfo,
  IGachaCeilItem,
  IGachaInfo,
} from "../../types";
import { getRemoteAssetURL, useCachedData } from "../../utils";
import { CardThumb, CardThumbs } from "../subs/CardThumb";
import rarityNormal from "../../assets/rarity_star_normal.png";
import { useTranslation } from "react-i18next";
import { useAssetI18n } from "../../utils/i18n";
import { SettingContext } from "../../context";
import { ContentTrans } from "../subs/ContentTrans";
import { useInteractiveStyles } from "../../styles/interactive";
import CommonMaterialIcon from "../subs/CommonMaterialIcon";

const gachaImageNameMap: {
  [key: number]: {
    bg: string;
    feature?: string;
  };
} = {
  1: {
    bg: "bg_gacha1",
    feature: "img_gacha1_1",
  },
  2: {
    bg: "bg_gacha_rare3_ticket_2020",
  },
  3: {
    bg: "bg_gacha_virtualsinger_2020",
  },
  7: {
    bg: "bg_gacha6",
    feature: "img_gacha6",
  },
  8: {
    bg: "bg_gacha8",
  },
};

const useStyles = makeStyles((theme) => ({
  media: {
    paddingTop: "56.25%",
    cursor: "pointer",
  },
  card: {
    margin: theme.spacing(0.5),
  },
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  subheader: {
    "white-space": "nowrap",
    overflow: "hidden",
    "text-overflow": "ellipsis",
    "max-width": "260px",
  },
  gachaBtn: {
    margin: theme.spacing(0, 1),
  },
  bannerImg: {
    maxWidth: "100%",
  },
}));

const StarIcon: React.FC<{ num: number }> = ({ num }) => (
  <Fragment>
    {Array.from({ length: num }).map((_, idx) => (
      <img key={idx} src={rarityNormal} alt="star" height="24px" />
    ))}
  </Fragment>
);

const GachaDetailPage: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { gachaId } = useParams<{ gachaId: string }>();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [gachas] = useCachedData<IGachaInfo>("gachas");
  const [gachaCeilItems] = useCachedData<IGachaCeilItem>("gachaCeilItems");
  const [cards] = useCachedData<ICardInfo>("cards");

  const [gacha, setGacha] = useState<IGachaInfo>();
  const [gachaCeilItem, setGachaCeilItem] = useState<IGachaCeilItem>();
  const [visible, setVisible] = useState<boolean>(false);
  const [picTabVal, setPicTabVal] = useState<string>("2");
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [statistic, setStatistic] = useState<GachaStatistic>({
    total: 0,
    rarity1: 0,
    rarity2: 0,
    rarity3: 0,
    rarity4: 0,
  });
  const [currentGachaResult, setCurrentGachaResult] = useState<GachaDetail[]>(
    []
  );
  const [weights, setWeights] = useState<number[]>([0, 0, 0, 0]);
  const [normalRates, setNormalRates] = useState<number[]>([0, 0, 0, 0]);
  const [guaranteedRate, setGuaranteedRate] = useState<number[]>([0, 0, 0, 0]);
  const [isSummaryDialog, setIsSummaryDialog] = useState(false);
  const [isDescDialog, setIsDescDialog] = useState(false);
  const [isCardsDialog, setIsCardsDialog] = useState(false);
  const [gachaCards, setGachaCards] = useState<number[]>([]);

  const doGacha = useCallback(
    (times: number) => {
      if (!gacha || !cards) return;
      const rollTimes = times;
      const rollResult = [
        gacha.rarity1Rate,
        gacha.rarity1Rate! + gacha.rarity2Rate!,
        gacha.rarity1Rate! + gacha.rarity2Rate! + gacha.rarity3Rate!,
        gacha.rarity1Rate! +
          gacha.rarity2Rate! +
          gacha.rarity3Rate! +
          gacha.rarity4Rate!,
      ];
      const must3RollResult = [100 - gacha.rarity4Rate!, 100];
      const rollCards = [
        gacha.gachaDetails
          .filter(
            (elem) =>
              cards.find((card) => card.id === elem.cardId)?.rarity === 1
          )!
          .sort((a, b) => a.weight - b.weight),
        gacha.gachaDetails
          .filter(
            (elem) =>
              cards.find((card) => card.id === elem.cardId)?.rarity === 2
          )!
          .sort((a, b) => a.weight - b.weight),
        gacha.gachaDetails
          .filter(
            (elem) =>
              cards.find((card) => card.id === elem.cardId)?.rarity === 3
          )!
          .sort((a, b) => a.weight - b.weight),
        gacha.gachaDetails
          .filter(
            (elem) =>
              cards.find((card) => card.id === elem.cardId)?.rarity === 4
          )!
          .sort((a, b) => a.weight - b.weight),
      ];
      const rollWeights = rollCards.map((elem) =>
        elem?.map((_elem) => _elem.weight)
      );
      const tmpGachaResult: GachaDetail[] = [];
      let noStar3Count = 0;
      for (let i = 0; i < rollTimes; i++) {
        if (i % 10 === 9 && noStar3Count === 9) {
          // only roll 3* or 4*
          const roll = Math.random() * 100;
          if (roll < must3RollResult[0]) {
            // get 3* card
            setStatistic((s) =>
              Object.assign({}, s, {
                total: s.total + 1,
                rarity3: s.rarity3 + 1,
              })
            );
            // roll a 3* card
            let acc = 0;
            const weightArr = rollWeights[2].map((weight) => (acc += weight));
            const weightSum = weights[2];
            const rand = Math.floor(Math.random() * weightSum);
            tmpGachaResult.push(
              rollCards[2][weightArr.filter((weight) => weight < rand).length]
            );
          } else if (roll < must3RollResult[1]) {
            // get 4* card
            setStatistic((s) =>
              Object.assign({}, s, {
                total: s.total + 1,
                rarity4: s.rarity4 + 1,
              })
            );
            // roll a 4* card
            let acc = 0;
            const weightArr = rollWeights[3].map((weight) => (acc += weight));
            const weightSum = weights[3];
            const rand = Math.floor(Math.random() * weightSum);
            tmpGachaResult.push(
              rollCards[3][weightArr.filter((weight) => weight < rand).length]
            );
          } else {
            console.log(roll, must3RollResult);
          }
          noStar3Count = 0;
          continue;
        } else if (i % 10 === 0) {
          noStar3Count = 0;
        }
        const roll = Math.random() * 100;
        if (roll <= rollResult[0]!) {
          // get 1* card
          setStatistic((s) =>
            Object.assign({}, s, {
              total: s.total + 1,
              rarity1: s.rarity1 + 1,
            })
          );
          // roll a 1* card
          let acc = 0;
          const weightArr = rollWeights[0].map((weight) => (acc += weight));
          const weightSum = weights[0];
          const rand = Math.floor(Math.random() * weightSum);
          tmpGachaResult.push(
            rollCards[0][weightArr.filter((weight) => weight < rand).length]
          );
          noStar3Count++;
        } else if (roll <= rollResult[1]!) {
          // get 2* card
          setStatistic((s) =>
            Object.assign({}, s, {
              total: s.total + 1,
              rarity2: s.rarity2 + 1,
            })
          );
          // roll a 2* card
          let acc = 0;
          const weightArr = rollWeights[1].map((weight) => (acc += weight));
          const weightSum = weights[1];
          const rand = Math.floor(Math.random() * weightSum);
          tmpGachaResult.push(
            rollCards[1][weightArr.filter((weight) => weight < rand).length]
          );
          noStar3Count++;
        } else if (roll <= rollResult[2]!) {
          // get 3* card
          setStatistic((s) =>
            Object.assign({}, s, {
              total: s.total + 1,
              rarity3: s.rarity3 + 1,
            })
          );
          // roll a 3* card
          let acc = 0;
          const weightArr = rollWeights[2].map((weight) => (acc += weight));
          const weightSum = weights[2];
          const rand = Math.floor(Math.random() * weightSum);
          tmpGachaResult.push(
            rollCards[2][weightArr.filter((weight) => weight < rand).length]
          );
        } else if (roll <= rollResult[3]!) {
          // get 4* card
          setStatistic((s) =>
            Object.assign({}, s, {
              total: s.total + 1,
              rarity4: s.rarity4 + 1,
            })
          );
          // roll a 4* card
          let acc = 0;
          const weightArr = rollWeights[3].map((weight) => (acc += weight));
          const weightSum = weights[3];
          const rand = Math.floor(Math.random() * weightSum);
          tmpGachaResult.push(
            rollCards[3][weightArr.filter((weight) => weight < rand).length]
          );
        } else {
          console.log(roll, rollResult);
        }
      }

      setCurrentGachaResult(tmpGachaResult.slice(-10));
    },
    [cards, gacha, weights]
  );

  const resetGacha = useCallback(() => {
    setStatistic({
      total: 0,
      rarity1: 0,
      rarity2: 0,
      rarity3: 0,
      rarity4: 0,
    });
    setCurrentGachaResult([]);
  }, [setStatistic, setCurrentGachaResult]);

  useEffect(() => {
    if (gachas && gachas.length)
      setGacha(gachas.find((elem) => elem.id === Number(gachaId)));
  }, [gachaId, gachas]);

  useEffect(() => {
    if (gacha && gachaCeilItems && gachaCeilItems.length) {
      setGachaCeilItem(
        gachaCeilItems.find((elem) => elem.id === gacha.gachaCeilItemId)
      );
    }
  }, [gacha, gachaCeilItems]);

  useEffect(() => {
    if (gacha) {
      const name = getTranslated(
        contentTransMode,
        `gacha_name:${gachaId}`,
        gacha.name
      );
      document.title = t("title:gachaDetail", {
        name,
      });
      setNormalRates([
        gacha.rarity1Rate,
        gacha.rarity2Rate,
        gacha.rarity3Rate,
        gacha.rarity4Rate,
      ]);
      setGuaranteedRate([0, 0, 100 - gacha.rarity4Rate, gacha.rarity4Rate]);
    }
  }, [gacha, contentTransMode, gachaId, getTranslated, t]);

  useEffect(() => {
    if (gacha && cards && cards.length) {
      // sum rate for rarity 1~4
      const weightArr = [0, 0, 0, 0];
      gacha.gachaDetails.forEach((detail) => {
        const card = cards.find((elem) => elem.id === detail.cardId)!;
        weightArr[card.rarity - 1] += detail.weight;
      });
      setWeights(weightArr);
    }
  }, [cards, gacha]);

  const [gachaBackground, setGachaBackground] = useState<string>("");
  const [gachaImage, setGachaImage] = useState<string>("");
  const [gachaIcon, setGachaIcon] = useState<string>("");
  const [gachaBanner, setGachaBanner] = useState("");
  const [gachaCeilItemIcon, setGachaCeilItemIcon] = useState("");

  useLayoutEffect(() => {
    if (gacha) {
      getRemoteAssetURL(
        `gacha/${gacha.assetbundleName}/screen_rip/texture/${
          (gachaImageNameMap[gacha.id] || { bg: `bg_gacha${gacha.id}` }).bg
        }.webp`,
        setGachaBackground
      );
      getRemoteAssetURL(
        `gacha/${gacha.assetbundleName}/screen_rip/texture/${
          (gachaImageNameMap[gacha.id] || { feature: `img_gacha${gacha.id}` })
            .feature
        }.webp`,
        setGachaImage
      );
      getRemoteAssetURL(
        `gacha/${gacha.assetbundleName}/logo_rip/logo.webp`,
        setGachaIcon
      );
      getRemoteAssetURL(
        `home/banner/banner_gacha${gacha.id}_rip/banner_gacha${gacha.id}.webp`,
        setGachaBanner
      );
    }
  }, [gacha]);

  useLayoutEffect(() => {
    if (gachaCeilItem) {
      getRemoteAssetURL(
        `thumbnail/gacha_item_rip/${gachaCeilItem.assetbundleName}.webp`,
        setGachaCeilItemIcon
      );
    }
  }, [gachaCeilItem]);

  const getGachaImages: (gacha: IGachaInfo) => ImageDecorator[] = useCallback(
    (gacha) => {
      const ret: ImageDecorator[] = [];
      if (gachaImageNameMap[gacha.id]) {
        if (gachaImageNameMap[gacha.id].bg) {
          ret.push({
            src: gachaBackground,
            alt: "background",
            downloadUrl: gachaBackground.replace(".webp", ".png"),
          });
        }
        if (gachaImageNameMap[gacha.id].feature) {
          ret.push({
            src: gachaImage,
            alt: "feature",
            downloadUrl: gachaImage.replace(".webp", ".png"),
          });
        }
      } else {
        ret.push({
          src: gachaBackground,
          alt: "background",
          downloadUrl: gachaBackground.replace(".webp", ".png"),
        });
        ret.push({
          src: gachaImage,
          alt: "feature",
          downloadUrl: gachaImage.replace(".webp", ".png"),
        });
      }

      return ret;
    },
    [gachaBackground, gachaImage]
  );

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setPicTabVal(newValue);
  };

  const getCardRate = useCallback(
    (cardId: number) => {
      if (gacha && cards && cards.length) {
        const detail = gacha.gachaDetails.find(
          (detail) => detail.cardId === cardId
        )!;
        const card = cards.find((card) => card.id === cardId)!;

        return (
          Math.round(
            (detail.weight / weights[card.rarity - 1]) *
              normalRates[card.rarity - 1] *
              1000
          ) /
            1000 +
          " %" +
          (card.rarity >= 3 &&
          gacha.gachaBehaviors.some(
            (behavior) => behavior.gachaBehaviorType === "over_rarity_3_once"
          )
            ? "\n" +
              Math.round(
                (detail.weight / weights[card.rarity - 1]) *
                  guaranteedRate[card.rarity - 1] *
                  1000
              ) /
                1000 +
              " %"
            : "")
        );
      }
      return "";
    },
    [cards, gacha, guaranteedRate, normalRates, weights]
  );

  if (gacha) {
    return (
      <Fragment>
        <Typography variant="h6" className={layoutClasses.header}>
          {getTranslated(contentTransMode, `gacha_name:${gachaId}`, gacha.name)}
        </Typography>
        <Container className={layoutClasses.content} maxWidth="sm">
          <TabContext value={picTabVal}>
            <Paper>
              <Tabs
                value={picTabVal}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="desktop"
              >
                <Tab label={t("gacha:tab.title.banner_logo")} value="2"></Tab>
                {gachaBackground && (
                  <Tab label={t("gacha:tab.title[3]")} value="0"></Tab>
                )}
                {gachaImage && (
                  <Tab label={t("gacha:tab.title[4]")} value="1"></Tab>
                )}
              </Tabs>
              <TabPanel value="0" classes={{ root: classes.tabpanel }}>
                <Card
                  onClick={() => {
                    setActiveIdx(0);
                    setVisible(true);
                  }}
                >
                  <CardMedia
                    className={classes.media}
                    image={gachaBackground}
                  ></CardMedia>
                </Card>
              </TabPanel>
              <TabPanel value="1" classes={{ root: classes.tabpanel }}>
                <Card
                  onClick={() => {
                    setActiveIdx(1);
                    setVisible(true);
                  }}
                >
                  <CardMedia
                    className={classes.media}
                    image={gachaImage}
                  ></CardMedia>
                </Card>
              </TabPanel>
              <TabPanel value="2" classes={{ root: classes.tabpanel }}>
                <Grid container direction="row">
                  <Grid item xs={12} md={6}>
                    <img
                      className={classes.bannerImg}
                      src={gachaIcon}
                      alt="logo"
                    ></img>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {gachaBanner && (
                      <img
                        className={classes.bannerImg}
                        src={gachaBanner}
                        alt="banner"
                      ></img>
                    )}
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>
          </TabContext>
          {/* <Container style={{marginTop: '2%'}} maxWidth="sm"> */}
          <Grid container direction="column">
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:id")}
              </Typography>
              <Typography>{gacha.id}</Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:title")}
              </Typography>
              <ContentTrans
                contentKey={`gacha_name:${gachaId}`}
                original={gacha.name}
                originalProps={{ align: "right" }}
                translatedProps={{ align: "right" }}
              />
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:startAt")}
              </Typography>
              <Typography>
                {new Date(gacha.startAt).toLocaleString()}
              </Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:endAt")}
              </Typography>
              <Typography>{new Date(gacha.endAt).toLocaleString()}</Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:type")}
              </Typography>
              <Typography>
                {t(`gacha:gachaType.${gacha.gachaType as "ceil"}`)}
              </Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            {gacha.gachaType === "ceil" && (
              <Fragment>
                <Grid
                  item
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("gacha:ceil_item")}
                  </Typography>
                  <img src={gachaCeilItemIcon} alt="gacha ceil item" />
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            )}
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("gacha:summary")}
              </Typography>
              <Button
                onClick={() => setIsSummaryDialog(true)}
                variant="contained"
              >
                {t("common:show")}
              </Button>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("gacha:description")}
              </Typography>
              <Button onClick={() => setIsDescDialog(true)} variant="contained">
                {t("common:show")}
              </Button>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
        </Container>
        <Typography variant="h6" className={layoutClasses.header}>
          {t("gacha:gacha_rate")}
        </Typography>
        <Container className={layoutClasses.content} maxWidth="sm">
          <Grid container direction="column">
            {gacha.gachaBehaviors.find(
              (gb) => gb.gachaBehaviorType === "normal"
            ) ? (
              <Fragment>
                <Grid
                  item
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item xs={2} md={4}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("gacha:normalRate")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    md={4}
                    container
                    direction="column"
                    alignItems="flex-end"
                  >
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={2} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {normalRates[1]} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={3} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {normalRates[2]} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={4} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {normalRates[3]} %
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ) : null}
            {gacha.gachaBehaviors.find(
              (gb) => gb.gachaBehaviorType === "over_rarity_3_once"
            ) && (
              <Fragment>
                <Grid
                  item
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item xs={2} md={4}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("gacha:guaranteedRate")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={9}
                    md={4}
                    container
                    direction="column"
                    alignItems="flex-end"
                  >
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={3} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {guaranteedRate[2]} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={4} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {guaranteedRate[3]} %
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            )}
          </Grid>
        </Container>
        <Typography variant="h6" className={layoutClasses.header}>
          {t("gacha:gacha_cards")}
        </Typography>
        <Container className={layoutClasses.content} maxWidth="sm">
          <Grid container direction="column">
            <Grid
              container
              wrap="nowrap"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("gacha:pickupMember", {
                  count: gacha.gachaPickups.length,
                })}
              </Typography>
              <Button
                onClick={() => {
                  setGachaCards(
                    gacha.gachaPickups.map((pickup) => pickup.cardId)
                  );
                  setIsCardsDialog(true);
                }}
                variant="contained"
              >
                {t("common:show")}
              </Button>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            {[4, 3, 2].map((rarity) => (
              <Fragment key={rarity}>
                <Grid
                  container
                  wrap="nowrap"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <StarIcon num={rarity} />
                  </Grid>
                  <Button
                    onClick={() => {
                      if (!cards || !cards.length) return;
                      setGachaCards(
                        gacha.gachaDetails
                          .map((detail) => detail.cardId)
                          .filter(
                            (cardId) =>
                              cards.find((card) => card.id === cardId)!
                                .rarity === rarity
                          )
                      );
                      setIsCardsDialog(true);
                    }}
                    variant="contained"
                  >
                    {t("common:show")}
                  </Button>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ))}
          </Grid>
        </Container>
        <Typography variant="h6" className={layoutClasses.header}>
          {t("gacha:gacha_behaviors")}
        </Typography>
        <Container className={layoutClasses.content} maxWidth="sm">
          <Grid container direction="column">
            {gacha.gachaBehaviors.map((behavior) => (
              <Fragment key={behavior.id}>
                <Grid
                  container
                  wrap="nowrap"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("gacha:behavior." + behavior.gachaBehaviorType)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <CommonMaterialIcon
                      materialName={behavior.costResourceType}
                      quantity={behavior.costResourceQuantity}
                    />
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ))}
          </Grid>
        </Container>
        <Typography variant="h6" className={layoutClasses.header}>
          {t("gacha:gacha_simulator")}
        </Typography>
        <Container className={layoutClasses.content} maxWidth="sm">
          <Grid container spacing={1} justify="center">
            <Grid item>
              <Button
                variant="contained"
                className={classes.gachaBtn}
                color="primary"
                onClick={() => doGacha(1)}
              >
                Gacha!
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                className={classes.gachaBtn}
                color="primary"
                onClick={() => doGacha(10)}
              >
                Gacha * 10
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                className={classes.gachaBtn}
                color="secondary"
                onClick={() => resetGacha()}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={1} justify="center">
            <Grid item>
              <Typography>
                {t("gacha:simulator.total")}: {statistic.total}
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                {t("gacha:simulator.cost")}: {statistic.total * 300}
              </Typography>
            </Grid>
            <Grid item xs={12} container justify="center">
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("common:rarity")}</TableCell>
                      <TableCell>{t("gacha:simulator.count")}</TableCell>
                      <TableCell>{t("gacha:simulator.percentage")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[2, 3, 4].map((rarity) => (
                      <Fragment key={rarity}>
                        <TableRow>
                          <TableCell>
                            <StarIcon num={rarity} />
                          </TableCell>
                          <TableCell>
                            {statistic[`rarity${rarity}` as "rarity1"]}
                          </TableCell>
                          <TableCell>
                            {statistic.total
                              ? (
                                  (statistic[`rarity${rarity}` as "rarity1"] /
                                    statistic.total) *
                                  100
                                ).toFixed(2)
                              : 0}
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <CardThumbs cardIds={currentGachaResult.map((elem) => elem.cardId)} />
        </Container>
        <Viewer
          visible={visible}
          onClose={() => setVisible(false)}
          images={getGachaImages(gacha)}
          zIndex={2000}
          activeIndex={activeIdx}
          downloadable
          downloadInNewWindow
          onMaskClick={() => setVisible(false)}
          zoomSpeed={0.25}
          onChange={(_, idx) => setActiveIdx(idx)}
        />
        <Dialog
          open={isSummaryDialog}
          onClose={() => setIsSummaryDialog(false)}
        >
          <DialogTitle>{t("gacha:summary")}</DialogTitle>
          <DialogContent>
            <Typography style={{ whiteSpace: "pre-line" }}>
              {gacha.gachaInformation.summary}
            </Typography>
          </DialogContent>
        </Dialog>
        <Dialog open={isDescDialog} onClose={() => setIsDescDialog(false)}>
          <DialogTitle>{t("gacha:description")}</DialogTitle>
          <DialogContent>
            <Typography style={{ whiteSpace: "pre-line" }}>
              {gacha.gachaInformation.description}
            </Typography>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isCardsDialog}
          onClose={() => {
            setGachaCards([]);
            setIsCardsDialog(false);
          }}
          fullWidth
        >
          <DialogTitle>{t("gacha:gacha_cards")}</DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              {gachaCards.map((cardId) => (
                <Grid key={cardId} item xs={4} md={2}>
                  <Link
                    to={"/card/" + cardId}
                    className={interactiveClasses.noDecoration}
                    target="_blank"
                  >
                    <Grid container direction="column">
                      <CardThumb cardId={cardId} />
                      <Typography
                        align="center"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {getCardRate(cardId)}
                      </Typography>
                    </Grid>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  } else {
    return (
      <div>
        Loading... If you saw this for a while, gacha {gachaId} does not exist.
      </div>
    );
  }
};

export default GachaDetailPage;
