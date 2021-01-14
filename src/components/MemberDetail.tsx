import {
  Card,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { useLayoutStyles } from "../styles/layout";
import {
  IGameChara,
  ICharaUnitInfo,
  ICharaProfile,
  ICardInfo,
  IUnitProfile,
} from "../types";
import { getRemoteAssetURL, useCachedData, useCharaName } from "../utils";
import { UnitLogoMap } from "../utils/resources";
import { CardThumb } from "./subs/CardThumb";
import ColorPreview from "./subs/ColorPreview";
import { SettingContext } from "../context";
import { CharaNameTrans, ContentTrans } from "./subs/ContentTrans";
import { OpenInNew } from "@material-ui/icons";

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
    maxHeight: "64px",
  },
  "unit-logo-large": {
    maxHeight: "64px",
    maxWidth: "100%",
  },
}));

const MemberDetail: React.FC<{}> = () => {
  const { charaId } = useParams<{ charaId: string }>();
  const classes = useStyle();
  const layoutClasses = useLayoutStyles();
  const { t } = useTranslation();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);
  const history = useHistory();

  const [cards] = useCachedData<ICardInfo>("cards");
  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [charaUnits] = useCachedData<ICharaUnitInfo>("gameCharacterUnits");
  const [charaProfiles] = useCachedData<ICharaProfile>("characterProfiles");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");

  const [chara, setChara] = useState<IGameChara>();
  const [charaUnit, setCharaUnit] = useState<ICharaUnitInfo>();
  const [charaSupportUnits, setCharaSupportUnits] = useState<
    (ICharaUnitInfo & IUnitProfile)[]
  >([]);
  const [charaProfile, setCharaProfile] = useState<ICharaProfile>();
  const [charaCards, setCharaCards] = useState<ICardInfo[]>([]);
  const [tabVal, setTabVal] = useState<string>("0");
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    if (
      charas &&
      charas.length &&
      charaUnits &&
      charaUnits.length &&
      charaProfiles &&
      charaProfiles.length &&
      cards &&
      cards.length &&
      unitProfiles &&
      unitProfiles.length
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
            .map((cu) =>
              Object.assign(
                {},
                cu,
                unitProfiles.find((up) => up.unit === cu.unit)
              )
            )
        );
      }
      setCharaProfile(charaProfiles.find((cp) => cp.characterId === chara?.id));
      setCharaCards(charaCards);
    }
  }, [
    charas,
    setChara,
    charaId,
    charaUnits,
    charaProfiles,
    cards,
    unitProfiles,
  ]);

  useEffect(() => {
    document.title = t("title:memberDetail", {
      name: getCharaName(Number(charaId)),
    });
  }, [t, charaId, getCharaName]);

  const [charaTrimImg, setCharaTrimImg] = useState<string>("");
  const [charaLabelHImg, setCharaLabelHImg] = useState<string>("");
  const [charaLabelVImg, setCharaLabelVImg] = useState<string>("");

  useEffect(() => {
    getRemoteAssetURL(
      `character/trim_rip/chr_trim_${charaId}.webp`,
      setCharaTrimImg
    );
    getRemoteAssetURL(
      `character/label_rip/chr_h_lb_${charaId}.webp`,
      setCharaLabelHImg
    );
    getRemoteAssetURL(
      `character/label_vertical_rip/chr_v_lb_${charaId}.webp`,
      setCharaLabelVImg
    );
  }, [charaId]);

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
                  image={charaTrimImg}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="1" classes={{ root: classes.tabpanel }}>
              <Card>
                <CardMedia
                  classes={{ root: classes.nameLabel }}
                  image={charaLabelHImg}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="2" classes={{ root: classes.tabpanel }}>
              <Card>
                <CardMedia
                  classes={{ root: classes.nameVerticalLabel }}
                  image={charaLabelVImg}
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
            <Grid item>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("member:name")}
              </Typography>
            </Grid>
            <Grid item>
              <CharaNameTrans
                characterId={Number(charaId)}
                originalProps={{ align: "right" }}
                translatedProps={{ align: "right" }}
              />
            </Grid>
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
            <Fragment key={key}>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={3}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("member:" + key)}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Grid container spacing={1} justify="flex-end">
                    <Grid item>
                      <Typography style={{ textTransform: "uppercase" }}>
                        {charaUnit[key as "colorCode"]}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <ColorPreview colorCode={charaUnit[key as "colorCode"]} />
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
              <Fragment key={key}>
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
                      <Grid item>
                        <ContentTrans
                          contentKey={`character_profile:${charaId}.${key}`}
                          original={charaProfile[key as "height"]}
                          originalProps={{
                            align: "right",
                            style: { whiteSpace: "pre-line" },
                          }}
                          translatedProps={{
                            align: "right",
                            style: { whiteSpace: "pre-line" },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            ))}
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("member:scenario")}
            </Typography>
            <IconButton
              onClick={() =>
                history.push(
                  `/storyreader/charaStory/${charaProfile.characterId}`
                )
              }
            >
              <OpenInNew />
            </IconButton>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      {charaSupportUnits.length ? (
        <Fragment>
          <Typography variant="h6" className={layoutClasses.header}>
            {t("common:support_unit")}
          </Typography>
          <Container className={layoutClasses.content}>
            <Grid
              className={classes["grid-out"]}
              container
              direction="row"
              justify="center"
              spacing={2}
            >
              {charaSupportUnits.map((csu) => (
                <Fragment key={"support-unit-" + csu.id}>
                  <Grid item xs={6} md={4}>
                    <Link
                      to={"/unit/" + csu.unit}
                      style={{ textDecoration: "none" }}
                    >
                      <Paper>
                        <Grid
                          container
                          direction="column"
                          wrap="nowrap"
                          alignItems="center"
                        >
                          <img
                            className={classes["unit-logo-large"]}
                            src={UnitLogoMap[csu.unit]}
                            alt={csu.unit}
                          ></img>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 600 }}
                            color="textPrimary"
                            align="center"
                          >
                            {csu.unitName}
                          </Typography>
                        </Grid>
                      </Paper>
                    </Link>
                  </Grid>
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
                <CardThumb cardId={cc.id}></CardThumb>
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
            src: charaTrimImg,
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
