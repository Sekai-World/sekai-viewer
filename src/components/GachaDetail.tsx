import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
// import { Star as StarIcon } from "@material-ui/icons";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";
import { GachaDetail, GachaStatistic, ICardInfo, IGachaInfo } from "../types";
import { useCachedData, useRefState } from "../utils";
import { CardThumbs } from "./subs/CardThumb";
import rarityNormal from "../assets/rarity_star_normal.png";

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
    padding: 0,
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
  if (gachaImageNameMap[gacha.id].bg) {
    ret.push({
      src: `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
        gacha.assetbundleName
      }/screen_rip/texture/${gachaImageNameMap[gacha.id].bg}.webp`,
      alt: "background",
      downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
        gacha.assetbundleName
      }/screen_rip/texture/${gachaImageNameMap[gacha.id].bg}.webp`,
    });
  }
  if (gachaImageNameMap[gacha.id].feature) {
    ret.push({
      src: `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
        gacha.assetbundleName
      }/screen_rip/texture/${gachaImageNameMap[gacha.id].feature}.webp`,
      alt: "feature",
      downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
        gacha.assetbundleName
      }/screen_rip/texture/${gachaImageNameMap[gacha.id].feature}.webp`,
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

const GachaDetailPage: React.FC<{}> = () => {
  const classes = useStyles();
  const { gachaId } = useParams<{ gachaId: string }>();

  const [gacha, setGacha] = useState<IGachaInfo>();
  const [gachas] = useCachedData<IGachaInfo>('gachas');
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

  const [cards] = useCachedData<ICardInfo>('cards');

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
    for (let i = 0; i < rollTimes; i++) {
      const roll = Math.random() * 99 + 1;
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
      document.title = `${gacha?.name} | Gacha | Sekai Viewer`;
    }
  }, [gacha]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setPicTabVal(newValue);
  };

  if (isReadyRef && gacha) {
    return (
      <Fragment>
        <TabContext value={picTabVal}>
          <Paper>
            <Tabs
              value={picTabVal}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="desktop"
            >
              <Tab label="Description" value="2"></Tab>
              <Tab label="Summary" value="3"></Tab>
              <Tab label="Simulator" value="4"></Tab>
              <Tab label="Background" value="0"></Tab>
              {gacha ? (
                gachaImageNameMap[gacha.id].feature ? (
                  <Tab label="Feature image" value="1"></Tab>
                ) : null
              ) : null}
            </Tabs>
          </Paper>
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
                    ? `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
                        gacha.assetbundleName
                      }/screen_rip/texture/${
                        gachaImageNameMap[gacha.id].bg
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
                    ? `https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${
                        gacha.assetbundleName
                      }/screen_rip/texture/${
                        gachaImageNameMap[gacha.id].feature
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
                    <Typography paragraph variant="body2" key={`desc-${line}`}>
                      {str}
                    </Typography>
                  ))}
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value="3" classes={{ root: classes.tabpanel }}>
            <Card>
              <CardContent>
                {gacha.gachaInformation.summary.split("\n").map((str, line) => (
                  <Typography paragraph variant="body2" key={`summary-${line}`}>
                    {str}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value="4" classes={{ root: classes.tabpanel }}>
            <Card>
              <CardContent>
                <Typography paragraph>
                  <StarIcon num={2} />
                  {gacha.rarity2Rate} % <StarIcon num={3} />
                  {gacha.rarity3Rate} % <StarIcon num={4} />
                  {gacha.rarity4Rate} %
                </Typography>
                <div>
                  <Button
                    variant="contained"
                    className={classes.gachaBtn}
                    color="secondary"
                    onClick={() => doGacha(1)}
                  >
                    Gacha!
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.gachaBtn}
                    color="primary"
                    onClick={() => doGacha(10)}
                  >
                    Gacha * 10
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.gachaBtn}
                    color="primary"
                    onClick={() => doGacha(100)}
                  >
                    Gacha * 100
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.gachaBtn}
                    color="primary"
                    onClick={() => doGacha(1000)}
                  >
                    Gacha * 1000
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.gachaBtn}
                    color="primary"
                    onClick={() => resetGacha()}
                  >
                    Reset
                  </Button>
                </div>
                <Typography paragraph>
                  <span style={{ marginRight: "1%" }}>
                    Total: {statistic.total}
                  </span>
                  <StarIcon num={2} />
                  {statistic.rarity2}{" "}
                  {statistic.total
                    ? ((statistic.rarity2 / statistic.total) * 100).toFixed(2)
                    : 0}{" "}
                  %
                  <StarIcon num={3} />
                  {statistic.rarity3}{" "}
                  {statistic.total
                    ? ((statistic.rarity3 / statistic.total) * 100).toFixed(2)
                    : 0}{" "}
                  %
                  <StarIcon num={4} />
                  {statistic.rarity4}{" "}
                  {statistic.total
                    ? ((statistic.rarity4 / statistic.total) * 100).toFixed(2)
                    : 0}{" "}
                  %
                </Typography>
              </CardContent>
              <CardContent>
                <CardThumbs
                  cardIds={currentGachaResult.map((elem) => elem.cardId)}
                />
              </CardContent>
            </Card>
          </TabPanel>
        </TabContext>
        {/* <Container style={{marginTop: '2%'}} maxWidth="sm"> */}
        <Box paddingX="2%" display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="no-wrap"
            justifyContent="space-between"
            alignItems="center"
            paddingY="1%"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              ID
            </Typography>
            <Typography>{gacha.id}</Typography>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="no-wrap"
            justifyContent="space-between"
            alignItems="center"
            paddingY="1%"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              Title
            </Typography>
            <Typography>{gacha.name}</Typography>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="no-wrap"
            justifyContent="space-between"
            alignItems="center"
            paddingY="1%"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              Icon
            </Typography>
            <img
              style={{ maxWidth: "50%" }}
              src={`https://sekai-res.dnaroma.eu/file/sekai-assets/gacha/${gacha.assetbundleName}/logo_rip/logo.webp`}
              alt="logo icon"
            ></img>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="no-wrap"
            justifyContent="space-between"
            alignItems="center"
            paddingY="1%"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              Start At
            </Typography>
            <Typography>{new Date(gacha.startAt).toLocaleString()}</Typography>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="no-wrap"
            justifyContent="space-between"
            alignItems="center"
            paddingY="1%"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              End At
            </Typography>
            <Typography>{new Date(gacha.endAt).toLocaleString()}</Typography>
          </Box>
          <Divider />
        </Box>
        {/* </Container> */}
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
    return <div>Loading...</div>;
  }
};

export default GachaDetailPage;
