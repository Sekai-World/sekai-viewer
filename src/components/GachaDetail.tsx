import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { TabContext, TabPanel } from "@material-ui/lab";
import Axios from "axios";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GahcaRootObject } from "../types";
import { useRefState } from "../utils";

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
}));

const GachaDetail: React.FC<{}> = () => {
  const classes = useStyles();
  const { gachaId } = useParams<{ gachaId: string }>();

  const [gacha, setGacha] = useState<GahcaRootObject>();
  const [picTabVal, setPicTabVal] = useState<string>("3");

  const [, isReadyRef, setIsReady] = useRefState<boolean>(false);

  const fetchGachas = useCallback(async () => {
    const { data: gachas }: { data: GahcaRootObject[] } = await Axios.get(
      "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/gachas.json"
    );
    return gachas;
  }, []);

  useEffect(() => {
    setIsReady(false);
    fetchGachas()
      .then((fgachas) => {
        setGacha(fgachas.find((gacha) => gacha.id === Number(gachaId))!);
      })
      .then(() => setIsReady(true));
  }, [fetchGachas, setIsReady, gachaId]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    console.log(newValue);
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
              scrollButtons="auto"
            >
              <Tab label="Description" value="2"></Tab>
              <Tab label="Summary" value="3"></Tab>
              <Tab label="Background" value="0"></Tab>
              {gacha ? (
                gachaImageNameMap[gacha.id].feature ? (
                  <Tab label="Feature image" value="1"></Tab>
                ) : null
              ) : null}
            </Tabs>
          </Paper>
          <TabPanel value="0" classes={{ root: classes.tabpanel }}>
            <Card>
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
            <Card>
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
                {gacha.gachaInformation.description.split("\n").map((str) => (
                  <Typography paragraph>{str}</Typography>
                ))}
              </CardContent>
            </Card>
          </TabPanel>
          <TabPanel value="3" classes={{ root: classes.tabpanel }}>
            <Card>
              <CardContent>
                {gacha.gachaInformation.summary.split("\n").map((str) => (
                  <Typography paragraph>{str}</Typography>
                ))}
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
      </Fragment>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default GachaDetail;
