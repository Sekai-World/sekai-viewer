import {
  Box,
  Card,
  CardMedia,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Slider,
  Tab,
  Tabs,
  Typography,
  Container,
  Chip,
} from "@material-ui/core";
import { useLayoutStyles } from "../../styles/layout";
import { useInteractiveStyles } from "../../styles/interactive";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";

import {
  ICardEpisode,
  ICardInfo,
  ICardRarity,
  ICharacterRank,
  IGameChara,
  ISkillInfo,
  IUnitProfile,
} from "../../types";
import { getRemoteAssetURL, useCachedData, useCharaName } from "../../utils";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";

import { CardThumb } from "../subs/CardThumb";
import {
  attrIconMap,
  UnitLogoMiniMap,
  charaIcons,
} from "../../utils/resources";
import { useTranslation } from "react-i18next";
import MaterialIcon from "../subs/MaterialIcon";
import { useAssetI18n } from "../../utils/i18n";
import { SettingContext } from "../../context";
import {
  CharaNameTrans,
  ContentTrans,
  ReleaseCondTrans,
} from "../subs/ContentTrans";
import ResourceBox from "../subs/ResourceBox";
import { Adsense } from "@ctrl/react-adsense";

const useStyles = makeStyles((theme) => ({
  "rarity-star-img": {
    maxWidth: "32px",
    margin: theme.spacing(0, 0.25),
  },
  "card-thumb-img": {
    maxWidth: "100%",
    // margin: theme.spacing(0, 1),
  },
  "unit-logo-img": {
    maxWidth: "128px",
    // margin: theme.spacing(0, 1),
  },
  media: {
    paddingTop: "56.25%",
    cursor: "pointer",
  },
  "media-contain": {
    paddingTop: "56.25%",
    backgroundSize: "contain",
    cursor: "pointer",
  },
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

interface IExtendCardInfo extends ICardInfo {
  maxTrainedLevel?: number;
  maxNormalLevel: number;
}

const CardDetail: React.FC<{}> = () => {
  const classes = useStyles();
  const layoutClasses = useLayoutStyles();
  const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { assetT, getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;
  const getCharaName = useCharaName(contentTransMode);

  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [rarities] = useCachedData<ICardRarity>("cardRarities");
  const [episodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [charaRanks] = useCachedData<ICharacterRank>("characterRanks");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");

  const { cardId } = useParams<{ cardId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [card, setCard] = useState<IExtendCardInfo>();
  const [cardTitle, setCardTitle] = useState<string>("");
  const [tabVal, setTabVal] = useState<string>("0");
  const [episodeTabVal, setEpisodeTabVal] = useState<string>("1");
  const [cardLevel, setCardLevel] = useState<number | number[]>(0);
  const [skill, setSkill] = useState<ISkillInfo>();
  const [skillLevel, setSkillLevel] = useState<number | number[]>(0);
  const [cardEpisode, setCardEpisode] = useState<ICardEpisode[]>([]);
  const [sideStory1Unlocked, setSideStory1Unlocked] = useState<boolean>(true);
  const [sideStory2Unlocked, setSideStory2Unlocked] = useState<boolean>(true);
  // const [cardRank, setCardRank] = useState<number | number[]>(0);
  // const [maxCardRank, setMaxCardRank] = useState<number>(0);

  const getSkillDesc = useCallback(
    (skill: ISkillInfo, skillLevel: number | number[]) => {
      let originalSkillInfo = skill.description;
      let translatedSkillInfo = assetT(
        `skill_desc:${skill.id}`,
        skill.description,
        {
          interpolation: { prefix: "[", suffix: "]" },
        }
      );

      for (let elem of skill.skillEffects) {
        const skillEffectDetail = elem.skillEffectDetails.find(
          (d) => d.level === skillLevel
        )!;
        originalSkillInfo = originalSkillInfo.replace(
          new RegExp(`{{${elem.id};d}}`),
          String(skillEffectDetail.activateEffectDuration)
        );
        originalSkillInfo = originalSkillInfo.replace(
          new RegExp(`{{${elem.id};v}}`),
          String(skillEffectDetail.activateEffectValue)
        );
        translatedSkillInfo = translatedSkillInfo.replace(
          new RegExp(`{{${elem.id};d}}`),
          String(skillEffectDetail.activateEffectDuration)
        );
        translatedSkillInfo = translatedSkillInfo.replace(
          new RegExp(`{{${elem.id};v}}`),
          String(skillEffectDetail.activateEffectValue)
        );
      }

      switch (contentTransMode) {
        case "original":
          return <Typography align="right">{originalSkillInfo}</Typography>;
        case "translated":
          return <Typography align="right">{translatedSkillInfo}</Typography>;
        case "both":
          return (
            <Grid container direction="column">
              <Typography color="textPrimary" align="right">
                {originalSkillInfo}
              </Typography>
              <Typography color="textSecondary" align="right">
                {translatedSkillInfo}
              </Typography>
            </Grid>
          );
      }
    },
    [contentTransMode, assetT]
  );

  const getCharaUnitName = useCallback(
    (charaId: number) => {
      if (!charas || !charas.length) return;
      const chara = charas.find((chara) => chara.id === charaId);
      return chara?.unit;
    },
    [charas]
  );

  const getCharaUnitImage = useCallback(
    (charaId: number) => {
      if (!charas || !charas.length) return;
      const chara = charas.find((chara) => chara.id === charaId);
      return chara ? UnitLogoMiniMap[chara!.unit] : undefined;
    },
    [charas]
  );

  useEffect(() => {
    if (!cards || !cards.length) return;
    const _card = cards.find((elem) => elem.id === Number(cardId))!;
    if (_card) {
      const prefix = getTranslated(
        contentTransMode,
        `card_prefix:${_card.id}`,
        _card.prefix
      );
      document.title = t("title:cardDetail", {
        prefix,
        character: getCharaName(_card.characterId),
      });
    }
  }, [cards, cardId, contentTransMode, getCharaName, assetT, getTranslated, t]);

  useEffect(() => {
    if (
      cards &&
      cards.length &&
      rarities &&
      rarities.length &&
      skills &&
      skills.length &&
      episodes &&
      episodes.length
    ) {
      const _card = cards.find((elem) => elem.id === Number(cardId))!;
      setCard(
        Object.assign({}, _card, {
          maxTrainedLevel: rarities.find((elem) => elem.rarity === _card.rarity)
            ?.trainingMaxLevel,
          maxNormalLevel: rarities.find((elem) => elem.rarity === _card.rarity)
            ?.maxLevel!,
        })
      );
      setCardTitle(
        `${getTranslated(
          contentTransMode,
          `card_prefix:${_card.id}`,
          _card.prefix
        )} - ${getCharaName(_card.characterId)}`
      );
      setCardLevel(
        _card.rarity >= 3
          ? rarities.find((elem) => elem.rarity === _card.rarity)
              ?.trainingMaxLevel!
          : rarities.find((elem) => elem.rarity === _card.rarity)?.maxLevel!
      );
      const _skill = skills.find((elem) => elem.id === _card.skillId)!;
      setSkill(_skill);
      setSkillLevel(
        _skill.skillEffects[0].skillEffectDetails[
          _skill.skillEffects[0].skillEffectDetails.length - 1
        ].level
      );
      setCardEpisode(episodes.filter((epi) => epi.cardId === Number(cardId)));
    }
  }, [
    setCard,
    cards,
    cardId,
    rarities,
    skills,
    getCharaName,
    episodes,
    contentTransMode,
    assetT,
    getTranslated,
    t,
  ]);

  const [normalImg, setNormalImg] = useState<string>("");
  const [trainedImg, setTrainedImg] = useState<string>("");
  const [normalTrimImg, setNormalTrimImg] = useState<string>("");
  const [trainedTrimImg, setTrainedTrimImg] = useState<string>("");

  useEffect(() => {
    if (card) {
      getRemoteAssetURL(
        `character/member/${card.assetbundleName}_rip/card_normal.webp`,
        setNormalImg,
        window.isChinaMainland
      );
      getRemoteAssetURL(
        `character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
        setNormalTrimImg,
        window.isChinaMainland
      );
      if (card.rarity >= 3) {
        getRemoteAssetURL(
          `character/member/${card.assetbundleName}_rip/card_after_training.webp`,
          setTrainedImg,
          window.isChinaMainland
        );
        getRemoteAssetURL(
          `character/member_cutout_trm/${card.assetbundleName}_rip/after_training.webp`,
          setTrainedTrimImg,
          window.isChinaMainland
        );
      }
    }
  }, [card]);

  const getCardImages: () => ImageDecorator[] = useCallback(
    () =>
      card
        ? card?.rarity >= 3
          ? [
              {
                src: normalImg,
                alt: "card normal",
                downloadUrl: normalImg.replace(".webp", ".png"),
              },
              {
                src: normalTrimImg,
                alt: "card normal trim",
                downloadUrl: normalTrimImg.replace(".webp", ".png"),
              },
              {
                src: trainedImg,
                alt: "card after training",
                downloadUrl: trainedImg.replace(".webp", ".png"),
              },
              {
                src: trainedTrimImg,
                alt: "card after training trim",
                downloadUrl: trainedTrimImg.replace(".webp", ".png"),
              },
            ]
          : [
              {
                src: normalImg,
                alt: "card normal",
                downloadUrl: normalImg.replace(".webp", ".png"),
              },
              {
                src: normalTrimImg,
                alt: "card normal",
                downloadUrl: normalTrimImg.replace(".webp", ".png"),
              },
            ]
        : [],
    [card, normalImg, normalTrimImg, trainedImg, trainedTrimImg]
  );

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabVal(newValue);
  };

  return card &&
    charaRanks &&
    charaRanks.length &&
    unitProfiles &&
    unitProfiles.length ? (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {cardTitle}
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
              <Tab label={t("card:tab.title[0]")} value="0"></Tab>
              <Tab label={t("card:tab.title[1]")} value="2"></Tab>
              {card.rarity >= 3 ? (
                <Tab label={t("card:tab.title[2]")} value="1"></Tab>
              ) : null}
              {card.rarity >= 3 ? (
                <Tab label={t("card:tab.title[3]")} value="3"></Tab>
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
                  classes={{ root: classes.media }}
                  image={normalImg}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="1" classes={{ root: classes.tabpanel }}>
              <Card
                onClick={() => {
                  setActiveIdx(2);
                  setVisible(true);
                }}
              >
                <CardMedia
                  classes={{ root: classes.media }}
                  image={trainedImg}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="2" classes={{ root: classes.tabpanel }}>
              <Card
                onClick={() => {
                  setActiveIdx(1);
                  setVisible(true);
                }}
              >
                <CardMedia
                  classes={{ root: classes["media-contain"] }}
                  image={normalTrimImg}
                ></CardMedia>
              </Card>
            </TabPanel>
            <TabPanel value="3" classes={{ root: classes.tabpanel }}>
              <Card
                onClick={() => {
                  setActiveIdx(3);
                  setVisible(true);
                }}
              >
                <CardMedia
                  classes={{ root: classes["media-contain"] }}
                  image={trainedTrimImg}
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
            <Typography>{card.id}</Typography>
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
                {t("common:title")}
              </Typography>
            </Grid>
            <Grid item>
              <ContentTrans
                contentKey={`card_prefix:${card.id}`}
                original={card.prefix}
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
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:character")}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Link
                to={"/chara/" + card.characterId}
                style={{ textDecoration: "none" }}
              >
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justify="flex-end"
                >
                  <Grid item>
                    <CharaNameTrans
                      characterId={card.characterId}
                      originalProps={{ align: "right", color: "textPrimary" }}
                      translatedProps={{ align: "right" }}
                    />
                  </Grid>
                  <Grid item>
                    <img
                      className={classes["rarity-star-img"]}
                      src={charaIcons[`CharaIcon${card.characterId}`]}
                      alt={getCharaName(card.characterId)}
                    ></img>
                  </Grid>
                </Grid>
              </Link>
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
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:unit")}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Link
                to={"/unit/" + getCharaUnitName(card.characterId)}
                style={{ textDecoration: "none" }}
              >
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justify="flex-end"
                >
                  <Grid item>
                    <ContentTrans
                      contentKey={`unit_profile:${getCharaUnitName(
                        card.characterId
                      )}.name`}
                      original={
                        unitProfiles.find(
                          (up) => up.unit === getCharaUnitName(card.characterId)
                        )!.unitName
                      }
                      originalProps={{ align: "right", color: "textPrimary" }}
                      translatedProps={{ align: "right" }}
                    />
                  </Grid>
                  <Grid item>
                    <img
                      className={classes["rarity-star-img"]}
                      src={getCharaUnitImage(card.characterId)}
                      alt={getCharaUnitName(card.characterId)}
                    ></img>
                  </Grid>
                </Grid>
              </Link>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {card.supportUnit !== "none" ? (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={3}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:support_unit")}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Link
                    to={"/unit/" + card.supportUnit}
                    style={{ textDecoration: "none" }}
                  >
                    <Grid
                      container
                      spacing={1}
                      alignItems="center"
                      justify="flex-end"
                    >
                      <Grid item>
                        <ContentTrans
                          contentKey={`unit_profile:${card.supportUnit}.name`}
                          original={
                            unitProfiles.find(
                              (up) => up.unit === card.supportUnit
                            )!.unitName
                          }
                          originalProps={{
                            align: "right",
                            color: "textPrimary",
                          }}
                          translatedProps={{ align: "right" }}
                        />
                      </Grid>
                      <Grid item>
                        <img
                          className={classes["rarity-star-img"]}
                          src={UnitLogoMiniMap[card.supportUnit]}
                          alt={card.supportUnit}
                        ></img>
                      </Grid>
                    </Grid>
                  </Link>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ) : null}
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:attribute")}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Grid
                container
                spacing={1}
                alignItems="center"
                justify="flex-end"
              >
                <Grid item>
                  <Typography style={{ textTransform: "capitalize" }}>
                    {card.attr}
                  </Typography>
                  {/* <ContentTrans
                        mode={contentTransMode}
                        contentKey={`unit_profile:${card.supportUnit}.name`}
                        original={
                          unitProfiles.find(
                            (up) => up.unit === card.supportUnit
                          )!.unitName
                        }
                        originalProps={{ align: "right" }}
                        translatedProps={{ align: "right" }}
                      /> */}
                </Grid>
                <Grid item>
                  <img
                    src={attrIconMap[card.attr]}
                    alt={card.attr}
                    className={classes["rarity-star-img"]}
                  ></img>
                </Grid>
              </Grid>
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
              {t("common:startAt")}
            </Typography>
            <Typography>{new Date(card.releaseAt).toLocaleString()}</Typography>
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
              {t("common:rarity")}
            </Typography>
            <Typography>
              {Array.from({ length: card.rarity }).map((_, id) => (
                <img
                  className={classes["rarity-star-img"]}
                  src={
                    cardLevel > card.maxNormalLevel
                      ? rarityAfterTraining
                      : rarityNormal
                  }
                  alt={`star-${id}`}
                  key={`star-${id}`}
                ></img>
              ))}
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
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:thumb")}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Grid container direction="row" justify="flex-end" spacing={2}>
                <Grid item xs={12} md={6}>
                  <CardThumb cardId={Number(cardId)} />
                </Grid>
                {card.rarity >= 3 ? (
                  <Grid item xs={12} md={6}>
                    <CardThumb cardId={Number(cardId)} trained />
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:skill")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Paper className={interactiveClasses.container}>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("card:skillLevel")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box className={interactiveClasses.sliderContainer}>
                  <Slider
                    value={skillLevel}
                    onChange={(e, value) => setSkillLevel(value)}
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={
                      skill!.skillEffects[0].skillEffectDetails[
                        skill!.skillEffects[0].skillEffectDetails.length - 1
                      ].level
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("card:skillName")}
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <ContentTrans
                contentKey={`card_skill_name:${cardId}`}
                original={card.cardSkillName}
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
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("card:skillEffect")}
              </Typography>
            </Grid>
            <Grid item xs={9}>
              {getSkillDesc(skill!, skillLevel)}
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("card:stats")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Paper className={interactiveClasses.container}>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("card:cardLevel")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box className={interactiveClasses.sliderContainer}>
                  <Slider
                    value={cardLevel}
                    onChange={(e, value) => setCardLevel(value)}
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={
                      card.rarity >= 3
                        ? card.maxTrainedLevel
                        : card.maxNormalLevel
                    }
                    marks={
                      card.rarity >= 3
                        ? [
                            {
                              value: card.maxNormalLevel,
                              label: t("card:normal"),
                            },
                            {
                              value: card.maxTrainedLevel!,
                              label: t("card:trained"),
                            },
                          ]
                        : [
                            {
                              value: card.maxNormalLevel,
                              label: t("card:normal"),
                            },
                          ]
                    }
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justify="space-between"
            >
              <Grid item xs={12} md={2}>
                <Typography classes={{ root: interactiveClasses.caption }}>
                  {t("card:sideStory")}
                </Typography>
              </Grid>
              <Grid item container xs={12} md={9} spacing={1}>
                <Grid item>
                  <Chip
                    clickable
                    color={sideStory1Unlocked ? "primary" : "default"}
                    label={t("card:sideStory1Unlocked")}
                    onClick={() => setSideStory1Unlocked((v) => !v)}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    clickable
                    color={sideStory2Unlocked ? "primary" : "default"}
                    label={t("card:sideStory2Unlocked")}
                    onClick={() => setSideStory2Unlocked((v) => !v)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Grid className={classes["grid-out"]} container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:performance")}
            </Typography>
            <Typography>
              {card.cardParameters.find(
                (elem) =>
                  elem.cardParameterType === "param1" &&
                  elem.cardLevel === cardLevel
              )?.power! +
                (cardLevel > card.maxNormalLevel
                  ? card.specialTrainingPower1BonusFixed
                  : 0) +
                (sideStory1Unlocked ? cardEpisode[0].power1BonusFixed : 0) +
                (sideStory2Unlocked ? cardEpisode[1].power1BonusFixed : 0)}
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
              {t("common:technique")}
            </Typography>
            <Typography>
              {card.cardParameters.find(
                (elem) =>
                  elem.cardParameterType === "param2" &&
                  elem.cardLevel === cardLevel
              )?.power! +
                (cardLevel > card.maxNormalLevel
                  ? card.specialTrainingPower2BonusFixed
                  : 0) +
                (sideStory1Unlocked ? cardEpisode[0].power2BonusFixed : 0) +
                (sideStory2Unlocked ? cardEpisode[1].power2BonusFixed : 0)}
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
              {t("common:stamina")}
            </Typography>
            <Typography>
              {card.cardParameters.find(
                (elem) =>
                  elem.cardParameterType === "param3" &&
                  elem.cardLevel === cardLevel
              )?.power! +
                (cardLevel > card.maxNormalLevel
                  ? card.specialTrainingPower3BonusFixed
                  : 0) +
                (sideStory1Unlocked ? cardEpisode[0].power3BonusFixed : 0) +
                (sideStory2Unlocked ? cardEpisode[1].power3BonusFixed : 0)}
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
              {t("common:power")}
            </Typography>
            <Typography>
              {card.cardParameters
                .filter((elem) => elem.cardLevel === cardLevel)
                .reduce((sum, elem) => sum + elem.power, 0) +
                (cardLevel > card.maxNormalLevel
                  ? card.specialTrainingPower1BonusFixed +
                    card.specialTrainingPower2BonusFixed +
                    card.specialTrainingPower3BonusFixed
                  : 0) +
                (sideStory1Unlocked
                  ? cardEpisode[0].power1BonusFixed +
                    cardEpisode[0].power2BonusFixed +
                    cardEpisode[0].power3BonusFixed
                  : 0) +
                (sideStory2Unlocked
                  ? cardEpisode[1].power1BonusFixed +
                    cardEpisode[1].power2BonusFixed +
                    cardEpisode[1].power3BonusFixed
                  : 0)}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </Grid>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("card:sideStory", { count: cardEpisode.length })}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <TabContext value={episodeTabVal}>
          <Paper className={interactiveClasses.container}>
            <Tabs
              value={episodeTabVal}
              onChange={(e, v) => setEpisodeTabVal(v)}
              variant="scrollable"
              scrollButtons="desktop"
            >
              <Tab
                label={
                  <ContentTrans
                    contentKey={`card_episode_title:${cardEpisode[0].title}`}
                    original={cardEpisode[0].title}
                    originalProps={{ variant: "body2" }}
                    translatedProps={{ variant: "body2" }}
                  />
                }
                value="1"
              ></Tab>
              <Tab
                label={
                  <ContentTrans
                    contentKey={`card_episode_title:${cardEpisode[1].title}`}
                    original={cardEpisode[1].title}
                    originalProps={{ variant: "body2" }}
                    translatedProps={{ variant: "body2" }}
                  />
                }
                value="2"
              ></Tab>
            </Tabs>
          </Paper>
          <TabPanel value="1" classes={{ root: classes.tabpanel }}>
            <Grid container direction="column">
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:releaseCondition")}
                  </Typography>
                </Grid>
                <Grid item xs={8} container justify="flex-end">
                  <ReleaseCondTrans
                    releaseCondId={cardEpisode[0].releaseConditionId}
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
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:releaseCosts")}
                  </Typography>
                </Grid>
                <Grid item container spacing={1} xs={10} justify="flex-end">
                  {cardEpisode[0].costs.map((c, idx) => (
                    <Grid key={`episode-cost-${idx}`} item>
                      <MaterialIcon
                        materialId={c.resourceId}
                        quantity={c.quantity}
                      />
                    </Grid>
                  ))}
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
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:rewards")}
                  </Typography>
                </Grid>
                <Grid item xs={10}>
                  {cardEpisode[0].rewardResourceBoxIds.map((id) => (
                    <ResourceBox
                      resourceBoxId={id}
                      resourceBoxPurpose="episode_reward"
                      justify="flex-end"
                    />
                  ))}
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Grid>
          </TabPanel>
          <TabPanel value="2" classes={{ root: classes.tabpanel }}>
            <Grid container direction="column">
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justify="space-between"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:releaseCondition")}
                  </Typography>
                </Grid>
                <Grid item xs={8} container justify="flex-end">
                  <ReleaseCondTrans
                    releaseCondId={cardEpisode[1].releaseConditionId}
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
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:releaseCosts")}
                  </Typography>
                </Grid>
                <Grid item container spacing={1} xs={10} justify="flex-end">
                  {cardEpisode[1].costs.map((c, idx) => (
                    <Grid key={`episode-cost-${idx}`} item>
                      <MaterialIcon
                        materialId={c.resourceId}
                        quantity={c.quantity}
                      />
                    </Grid>
                  ))}
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
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:rewards")}
                  </Typography>
                </Grid>
                <Grid item container spacing={1} xs={10} justify="flex-end">
                  {cardEpisode[1].rewardResourceBoxIds.map((id) => (
                    <ResourceBox
                      resourceBoxId={id}
                      resourceBoxPurpose="episode_reward"
                      justify="flex-end"
                    />
                  ))}
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Grid>
          </TabPanel>
        </TabContext>
      </Container>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("common:advertisement")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="sm">
        <Adsense
          client="ca-pub-7767752375383260"
          slot="5596436251"
          format="auto"
          responsive="true"
        />
      </Container>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={getCardImages()}
        zIndex={2000}
        activeIndex={activeIdx}
        downloadable
        downloadInNewWindow
        onMaskClick={() => setVisible(false)}
        onChange={(_, idx) => setActiveIdx(idx)}
        zoomSpeed={0.25}
      />
    </Fragment>
  ) : (
    <div>
      Loading... If you saw this for a while, card {cardId} does not exist.
    </div>
  );
};

export default CardDetail;
