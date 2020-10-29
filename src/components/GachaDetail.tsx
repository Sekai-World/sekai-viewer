import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
  Container,
} from "@material-ui/core";
import { useLayoutStyles } from "../styles/layout";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import {
  ContentTransModeType,
  GachaDetail,
  GachaStatistic,
  ICardInfo,
  IGachaInfo,
} from "../types";
import { useCachedData, useRefState } from "../utils";
import { CardThumb, CardThumbs } from "./subs/CardThumb";
import rarityNormal from "../assets/rarity_star_normal.png";
import { useTranslation } from "react-i18next";
import { useAssetI18n } from "../utils/i18n";

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
}));

function getGachaImages(gacha: IGachaInfo): ImageDecorator[] {
  const ret: ImageDecorator[] = [];
  if (gachaImageNameMap[gacha.id]) {
    if (gachaImageNameMap[gacha.id].bg) {
      ret.push({
        src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${
          gacha.assetbundleName
        }/screen_rip/texture/${gachaImageNameMap[gacha.id].bg}.webp`,
        alt: "background",
        downloadUrl: `${
          process.env.REACT_APP_ASSET_DOMAIN
        }/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/${
          gachaImageNameMap[gacha.id].bg
        }.webp`,
      });
    }
    if (gachaImageNameMap[gacha.id].feature) {
      ret.push({
        src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${
          gacha.assetbundleName
        }/screen_rip/texture/${gachaImageNameMap[gacha.id].feature}.webp`,
        alt: "feature",
        downloadUrl: `${
          process.env.REACT_APP_ASSET_DOMAIN
        }/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/${
          gachaImageNameMap[gacha.id].feature
        }.webp`,
      });
    }
  } else {
    ret.push({
      src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/bg_gacha${gacha.id}.webp`,
      alt: "background",
      downloadUrl: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/bg_gacha${gacha.id}.webp`,
    });
    ret.push({
      src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/img_gacha${gacha.id}.webp`,
      alt: "feature",
      downloadUrl: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${gacha.assetbundleName}/screen_rip/texture/img_gacha${gacha.id}.webp`,
    });
  }

  return ret;
}

const StarIcon: React.FC<{ num: number }> = ({ num }) => (
  <Fragment>
    {Array.from({ length: num }).map((_, idx) => (
      <img key={idx} src={rarityNormal} alt="star" height="24px" />
    ))}
  </Fragment>
);

const GachaDetailPage: React.FC<{
  contentTransMode: ContentTransModeType;
}> = ({ contentTransMode }) => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const { gachaId } = useParams<{ gachaId: string }>();
  const { t } = useTranslation();
  const { assetT, assetI18n } = useAssetI18n();

  const [gacha, setGacha] = useState<IGachaInfo>();
  const [gachas] = useCachedData<IGachaInfo>("gachas");
  const [visible, setVisible] = useState<boolean>(false);
  const [picTabVal, setPicTabVal] = useState<string>("4");
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

  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const [cards] = useCachedData<ICardInfo>("cards");

  function doGacha(times: number) {
    const rollTimes = times;
    const rollResult = [
      gacha?.rarity1Rate,
      gacha?.rarity1Rate! + gacha?.rarity2Rate!,
      gacha?.rarity1Rate! + gacha?.rarity2Rate! + gacha?.rarity3Rate!,
      gacha?.rarity1Rate! +
        gacha?.rarity2Rate! +
        gacha?.rarity3Rate! +
        gacha?.rarity4Rate!,
    ];
    const must3RollResult = [100 - gacha?.rarity4Rate!, 100];
    const rollCards = [
      gacha?.gachaDetails.filter(
        (elem) => cards.find((card) => card.id === elem.cardId)?.rarity === 1
      )!,
      gacha?.gachaDetails.filter(
        (elem) => cards.find((card) => card.id === elem.cardId)?.rarity === 2
      )!,
      gacha?.gachaDetails.filter(
        (elem) => cards.find((card) => card.id === elem.cardId)?.rarity === 3
      )!,
      gacha?.gachaDetails.filter(
        (elem) => cards.find((card) => card.id === elem.cardId)?.rarity === 4
      )!,
    ];
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
          tmpGachaResult.push(
            rollCards[2][Math.floor(Math.random() * rollCards[2]?.length)]
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
          tmpGachaResult.push(
            rollCards[3][Math.floor(Math.random() * rollCards[3]?.length)]
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
        tmpGachaResult.push(
          rollCards[0][Math.floor(Math.random() * rollCards[0]?.length)]
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
        tmpGachaResult.push(
          rollCards[1][Math.floor(Math.random() * rollCards[1]?.length)]
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
        tmpGachaResult.push(
          rollCards[2][Math.floor(Math.random() * rollCards[2]?.length)]
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
        tmpGachaResult.push(
          rollCards[3][Math.floor(Math.random() * rollCards[3]?.length)]
        );
      } else {
        console.log(roll, rollResult);
      }
    }

    setCurrentGachaResult(tmpGachaResult.slice(-10));
  }

  function resetGacha() {
    setStatistic({
      total: 0,
      rarity1: 0,
      rarity2: 0,
      rarity3: 0,
      rarity4: 0,
    });
    setCurrentGachaResult([]);
  }

  useEffect(() => {
    setIsReady(Boolean(gachas.length));

    if (Boolean(gachas.length))
      setGacha(gachas.find((elem) => elem.id === Number(gachaId)));
  }, [setIsReady, gachaId, gachas]);

  useEffect(() => {
    if (gacha) {
      document.title = `${
        contentTransMode === "original"
          ? gacha.name
          : contentTransMode === "translated"
          ? assetT(`gacha_name:${gachaId}`, gacha.name)
          : gacha.name
      } | Gacha | Sekai Viewer`;
    }
  }, [gacha, assetI18n, contentTransMode, gachaId, assetT]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setPicTabVal(newValue);
  };

  if (isReadyRef && gacha) {
    return (
      <Fragment>
        <Typography variant="h6" className={layoutClasses.header}>
          {contentTransMode === "original"
            ? gacha.name
            : contentTransMode === "translated"
            ? assetT(`gacha_name:${gachaId}`, gacha.name)
            : gacha.name}
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
                <Tab label={t("gacha:tab.title[0]")} value="2"></Tab>
                <Tab label={t("gacha:tab.title[1]")} value="3"></Tab>
                <Tab label={t("gacha:tab.title[2]")} value="4"></Tab>
                <Tab label={t("gacha:tab.title[3]")} value="0"></Tab>
                {gachaImageNameMap[gacha.id] ? (
                  gachaImageNameMap[gacha.id].feature ? (
                    <Tab label={t("gacha:tab.title[4]")} value="1"></Tab>
                  ) : null
                ) : gacha.id >= 4 ? (
                  <Tab label={t("gacha:tab.title[4]")} value="1"></Tab>
                ) : null}
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
                    image={
                      gacha
                        ? `${
                            process.env.REACT_APP_ASSET_DOMAIN
                          }/file/sekai-assets/gacha/${
                            gacha.assetbundleName
                          }/screen_rip/texture/${
                            gachaImageNameMap[gacha.id]
                              ? gachaImageNameMap[gacha.id].bg
                              : `bg_gacha${gachaId}`
                          }.webp`
                        : ""
                    }
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
                    image={
                      gacha
                        ? `${
                            process.env.REACT_APP_ASSET_DOMAIN
                          }/file/sekai-assets/gacha/${
                            gacha.assetbundleName
                          }/screen_rip/texture/${
                            gachaImageNameMap[gacha.id]
                              ? gachaImageNameMap[gacha.id].feature
                              : `img_gacha${gachaId}`
                          }.webp`
                        : ""
                    }
                  ></CardMedia>
                </Card>
              </TabPanel>
              <TabPanel value="2" classes={{ root: classes.tabpanel }}>
                <Card>
                  <CardContent>
                    {gacha.gachaInformation.description
                      .split("\n")
                      .map((str, line) => (
                        <Typography
                          paragraph
                          variant="body2"
                          key={`desc-${line}`}
                        >
                          {str}
                        </Typography>
                      ))}
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel value="3" classes={{ root: classes.tabpanel }}>
                <Card>
                  <CardContent>
                    {gacha.gachaInformation.summary
                      .split("\n")
                      .map((str, line) => (
                        <Typography
                          paragraph
                          variant="body2"
                          key={`summary-${line}`}
                        >
                          {str}
                        </Typography>
                      ))}
                  </CardContent>
                </Card>
              </TabPanel>
              <TabPanel value="4" classes={{ root: classes.tabpanel }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={1} justify="center">
                      <Grid item>
                        <Button
                          variant="contained"
                          className={classes.gachaBtn}
                          color="secondary"
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
                      {/* <Grid item xs={4}>
                        <Button
                          variant="contained"
                          className={classes.gachaBtn}
                          color="primary"
                          onClick={() => doGacha(100)}
                        >
                          Gacha * 100
                        </Button>
                      </Grid>
                      <Grid item xs={4}>
                        <Button
                          variant="contained"
                          className={classes.gachaBtn}
                          color="primary"
                          onClick={() => doGacha(1000)}
                        >
                          Gacha * 1000
                        </Button>
                      </Grid> */}
                      <Grid item>
                        <Button
                          variant="contained"
                          className={classes.gachaBtn}
                          color="primary"
                          onClick={() => resetGacha()}
                        >
                          Reset
                        </Button>
                      </Grid>
                    </Grid>
                    <Grid container spacing={1} justify="center">
                      <Grid item>
                        <Typography>
                          Total: {statistic.total} Cost: {statistic.total * 300}
                        </Typography>
                      </Grid>
                      <Grid item container spacing={1} justify="center">
                        <Grid item>
                          <Typography>
                            <StarIcon num={2} />
                            {statistic.rarity2}{" "}
                            {statistic.total
                              ? (
                                  (statistic.rarity2 / statistic.total) *
                                  100
                                ).toFixed(2)
                              : 0}{" "}
                            %
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            <StarIcon num={3} />
                            {statistic.rarity3}{" "}
                            {statistic.total
                              ? (
                                  (statistic.rarity3 / statistic.total) *
                                  100
                                ).toFixed(2)
                              : 0}{" "}
                            %
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            <StarIcon num={4} />
                            {statistic.rarity4}{" "}
                            {statistic.total
                              ? (
                                  (statistic.rarity4 / statistic.total) *
                                  100
                                ).toFixed(2)
                              : 0}{" "}
                            %
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardContent>
                    <CardThumbs
                      cardIds={currentGachaResult.map((elem) => elem.cardId)}
                    />
                  </CardContent>
                </Card>
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
              <Typography>
                {contentTransMode === "original"
                  ? gacha.name
                  : contentTransMode === "translated"
                  ? assetT(`gacha_name:${gachaId}`, gacha.name)
                  : gacha.name}
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
                {t("common:icon")}
              </Typography>
              <img
                style={{ maxWidth: "50%" }}
                src={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/gacha/${gacha.assetbundleName}/logo_rip/logo.webp`}
                alt="logo icon"
              ></img>
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
                        {gacha.rarity2Rate} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={3} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {gacha.rarity3Rate} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={4} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {gacha.rarity4Rate} %
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ) : null}
            {gacha.gachaBehaviors.find(
              (gb) => gb.gachaBehaviorType === "over_rarity_3_once"
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
                        <StarIcon num={2} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        0 %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={3} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {100 - gacha.rarity4Rate} %
                      </Grid>
                    </Grid>
                    <Grid item container alignItems="center">
                      <Grid item xs={7} style={{ textAlign: "right" }}>
                        <StarIcon num={4} />
                      </Grid>
                      <Grid item xs={5} style={{ textAlign: "right" }}>
                        {gacha.rarity4Rate} %
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ) : null}
            <Grid
              container
              wrap="nowrap"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("gacha:pickupMember", { count: gacha.gachaPickups.length })}
              </Typography>
              <Grid
                item
                container
                direction="row"
                xs={6}
                spacing={1}
                justify="flex-end"
              >
                {gacha.gachaPickups.map((elem) => (
                  <Grid key={`pickup-${elem.id}`} item xs={8} md={4}>
                    <CardThumb id={elem.cardId} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Grid>
          {/* </Container> */}
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
