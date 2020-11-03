import {
  Card,
  CardMedia,
  Container,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { useLayoutStyles } from "../styles/layout";
import {
  ContentTransModeType,
  IGameChara,
  ICharaUnitInfo,
  ICharaProfile,
  ICardInfo,
} from "../types";
import { useCachedData, useCharaName } from "../utils";
import { UnitLogoMap } from "../utils/resources";
import { CardThumb } from "./subs/CardThumb";
// import { useAssetI18n } from "../utils/i18n";

const useStyle = makeStyles((theme) => ({
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  media: {
    paddingTop: "70%",
    cursor: "pointer",
  },
  nameLabel: {
    paddingTop: "30%",
    backgroundSize: "contain",
  },
  nameVerticalLabel: {
    paddingTop: "45%",
    backgroundSize: "contain",
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
  "unit-logo-img": {
    maxWidth: "128px",
  },
}));

const MemberDetail: React.FC<{ contentTransMode: ContentTransModeType }> = ({
  contentTransMode,
}) => {
  const { charaId } = useParams<{ charaId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  // const { assetT } = useAssetI18n();
  const getCharaName = useCharaName(contentTransMode);

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [charaUnits] = useCachedData<ICharaUnitInfo>("gameCharacterUnits");
  const [charaProfiles] = useCachedData<ICharaProfile>("characterProfiles");

  const [chara, setChara] = useState<IGameChara>();
  const [charaUnit, setCharaUnit] = useState<ICharaUnitInfo>();
  const [charaSupportUnits, setCharaSupportUnits] = useState<ICharaUnitInfo[]>(
    []
  );
  const [charaProfile, setCharaProfile] = useState<ICharaProfile>();
  const [charaCards, setCharaCards] = useState<ICardInfo[]>([]);
  const [tabVal, setTabVal] = useState<string>("0");
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    if (
      charas.length &&
      charaUnits.length &&
      charaProfiles.length &&
      cards.length
    ) {
      const chara = charas.find((c) => c.id === Number(charaId));
      const charaCards = cards.filter((card) => card.characterId === chara?.id);
      setChara(chara);
      setCharaUnit(
        charaUnits.find(
          (cu) => cu.gameCharacterId === chara?.id && cu.unit === chara?.unit
        )
      );
      // list support units if the character is a member of VIRTUAL SINGER
      if (chara?.unit === "piapro") {
        setCharaSupportUnits(
          charaUnits
            .filter(
              (cu) => cu.gameCharacterId === chara.id && cu.unit !== "piapro"
            )
            .filter((cu) => charaCards.some((cc) => cc.supportUnit === cu.unit))
        );
      }
      setCharaProfile(charaProfiles.find((cp) => cp.characterId === chara?.id));
      setCharaCards(charaCards);
    }
  }, [charas, setChara, charaId, charaUnits, charaProfiles, cards]);

  useEffect(() => {
    document.title = t("title:memberDetail", {
      name: getCharaName(Number(charaId)),
    });
  }, [t, charaId, getCharaName]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabVal(newValue);
  };

  return chara && charaUnit && charaProfile && charaCards.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {getCharaName(Number(charaId))}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <TabContext value={tabVal}>
          <Paper>
            <Tabs
              value={tabVal}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="desktop"
            >
              <Tab label={t("member:tab.title[0]")} value="0"></Tab>
              <Tab label={t("member:tab.title[1]")} value="1"></Tab>
              <Tab label={t("member:tab.title[2]")} value="2"></Tab>
            </Tabs>
            <TabPanel value="0" classes={{ root: classes.tabpanel }}>
              <Card
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
              >
                <CardMedia
                  classes={{ root: classes.media }}
                  image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/trim_rip/chr_trim_${charaId}.webp`}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="1" classes={{ root: classes.tabpanel }}>
              <Card
              // onClick={() => {
              //   setActiveIdx(0);
              //   setVisible(true);
              // }}
              >
                <CardMedia
                  classes={{ root: classes.nameLabel }}
                  image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/label_rip/chr_h_lb_${charaId}.webp`}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="2" classes={{ root: classes.tabpanel }}>
              <Card
              // onClick={() => {
              //   setActiveIdx(0);
              //   setVisible(true);
              // }}
              >
                <CardMedia
                  classes={{ root: classes.nameVerticalLabel }}
                  image={`${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/label_vertical_rip/chr_v_lb_${charaId}.webp`}
                ></CardMedia>
              </Card>
            </TabPanel>
          </Paper>
        </TabContext>
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:id")}
            </Typography>
            <Typography>{chara.id}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("member:name")}
            </Typography>
            <Typography>{getCharaName(chara.id)}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("member:hiragana")}
            </Typography>
            <Typography>
              {chara.firstNameRuby} {chara.givenNameRuby}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("member:gender.caption")}
            </Typography>
            <Typography>{t(`member:gender.${chara.gender}`)}</Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:unit")}
            </Typography>
            <Link to={"/unit/" + chara.unit}>
              <img
                className={classes["unit-logo-img"]}
                src={UnitLogoMap[chara.unit]}
                alt={chara.unit}
              ></img>
            </Link>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {[
            "colorCode",
            "skinColorCode",
            "skinShadowColorCode1",
            "skinShadowColorCode2",
          ].map((key) => (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("member:" + key)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Typography>{charaUnit[key as "colorCode"]}</Typography>
                    </Grid>
                    <Grid item>
                      <div
                        style={{
                          height: "26px",
                          width: "26px",
                          border: "solid 2px white",
                          backgroundColor: charaUnit[key as "colorCode"],
                        }}
                      ></div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ))}
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:profile")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Grid className={classes["grid-out"]} container direction="column">
          {Object.keys(charaProfile)
            .filter((key) => !["characterId", "scenarioId"].includes(key))
            .map((key) => (
              <Fragment>
                <Grid
                  container
                  direction="row"
                  wrap="nowrap"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("member:" + key)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={8}>
                    <Grid container justify="flex-end">
                      <Typography>{charaProfile[key as "height"]}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ))}
        </Grid>
      </Container>
      {charaSupportUnits.length ? (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:support_unit")}
          </Typography>
          <Container className={layoutClasses.content} maxWidth="sm">
            <Grid className={classes["grid-out"]} container direction="column">
              {charaSupportUnits.map((csu) => (
                <Fragment key={"support-unit-" + csu.id}>
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justify="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("common:unit")}
                    </Typography>
                    <Link to={"/unit/" + csu.unit}>
                      <img
                        className={classes["unit-logo-img"]}
                        src={UnitLogoMap[csu.unit]}
                        alt={csu.unit}
                      ></img>
                    </Link>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                </Fragment>
              ))}
            </Grid>
          </Container>
        </Fragment>
      ) : null}
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:card")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="lg">
        <Grid
          className={classes["grid-out"]}
          container
          direction="row"
          spacing={2}
        >
          {charaCards.map((cc) => (
            <Grid item xs={4} md={2} lg={1} key={"card-" + cc.id}>
              <Link to={"/card/" + cc.id} style={{ textDecoration: "none" }}>
                <CardThumb id={cc.id}></CardThumb>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            src: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/character/trim_rip/chr_trim_${charaId}.webp`,
            alt: t("member:tab.title[0]"),
          },
        ]}
        zIndex={2000}
        activeIndex={activeIdx}
        downloadable
        downloadInNewWindow
        onMaskClick={() => setVisible(false)}
        onChange={(_, idx) => setActiveIdx(idx)}
        zoomSpeed={0.25}
        noNavbar
      />
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, member {charaId} does not exist.
    </div>
  );
};

export default MemberDetail;
