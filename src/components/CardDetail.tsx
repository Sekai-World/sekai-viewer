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
} from "@material-ui/core";
import { TabContext, TabPanel } from "@material-ui/lab";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "react-viewer";
import { ImageDecorator } from "react-viewer/lib/ViewerProps";

import { ICardInfo, ICardRarity, ICharacterRank, ICharaProfile, ISkillInfo } from "../types";
import {
  useCachedData
} from "../utils";
import rarityNormal from "../assets/rarity_star_normal.png";
import rarityAfterTraining from "../assets/rarity_star_afterTraining.png";
import IconPerformance from "../assets/icon_performance.png";
import IconTechnique from "../assets/icon_technique.png";
import IconStamina from "../assets/icon_stamina.png";
import IconTotalStrength from "../assets/icon_totalStrength.png";

import LogoLightSound from "../assets/common/logol/logo_light_sound.png";
import LogoIdol from "../assets/common/logol/logo_idol.png";
import LogoPiapro from "../assets/common/logol/logo_piapro.png";
import LogoSchoolRefusal from "../assets/common/logol/logo_school_refusal.png";
import LogoStreet from "../assets/common/logol/logo_street.png";
import LogoThemePark from "../assets/common/logol/logo_theme_park.png";

import IconAttrCool from "../assets/icon_attribute_cool.png";
import IconAttrCute from "../assets/icon_attribute_cute.png";
import IconAttrHappy from "../assets/icon_attribute_happy.png";
import IconAttrMyster from "../assets/icon_attribute_mysterious.png";
import IconAttrPure from "../assets/icon_attribute_pure.png";
import { CardThumb } from "./subs/CardThumb";

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
    padding: 0,
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

const attrIconMap: { [key: string]: string } = {
  cool: IconAttrCool,
  cute: IconAttrCute,
  happy: IconAttrHappy,
  mysterious: IconAttrMyster,
  pure: IconAttrPure,
};

interface IExtendCardInfo extends ICardInfo {
  maxTrainedLevel?: number;
  maxNormalLevel: number;
}

function getSkillDesc(skill: ISkillInfo, skillLevel: number | number[]) {
  let skillInfo = skill.description;

  for (let elem of skill.skillEffects) {
    skillInfo = skillInfo.replace(
      new RegExp(`{{${elem.id};d}}`),
      String(
        elem.skillEffectDetails.find((d) => d.level === skillLevel)!
          .activateEffectDuration
      )
    );
    skillInfo = skillInfo.replace(
      new RegExp(`{{${elem.id};v}}`),
      String(
        elem.skillEffectDetails.find((d) => d.level === skillLevel)!
          .activateEffectValue
      )
    );
  }

  return skillInfo;
}

const CardDetail: React.FC<{}> = () => {
  const classes = useStyles();

  const [charas] = useCachedData<ICharaProfile>('gameCharacters');
  const [cards] = useCachedData<ICardInfo>('cards');
  const [rarities] = useCachedData<ICardRarity>('cardRarities');
  const [charaRanks] = useCachedData<ICharacterRank>('characterRanks');
  const [skills] = useCachedData<ISkillInfo>('skills');

  const { cardId } = useParams<{ cardId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [card, setCard] = useState<IExtendCardInfo>();
  const [tabVal, setTabVal] = useState<string>("0");
  const [cardLevel, setCardLevel] = useState<number | number[]>(0);
  const [skill, setSkill] = useState<ISkillInfo>();
  const [skillLevel, setSkillLevel] = useState<number | number[]>(0);
  // const [cardRank, setCardRank] = useState<number | number[]>(0);
  // const [maxCardRank, setMaxCardRank] = useState<number>(0);

  const getCharaName = useCallback(
    (charaId: number) => {
      const chara = charas.find((chara) => chara.id === charaId);
      if (chara?.firstName) {
        return `${chara.firstName} ${chara.givenName}`;
      }
      return chara?.givenName;
    },
    [charas]
  );

  const getCharaUnitName = useCallback(
    (charaId: number) => {
      const chara = charas.find((chara) => chara.id === charaId);
      return chara?.unit;
    },
    [charas]
  );

  const getCharaUnitImage = useCallback(
    (charaId: number) => {
      const chara = charas.find((chara) => chara.id === charaId);
      switch (chara?.unit) {
        case "idol":
          return LogoIdol;
        case "light_sound":
          return LogoLightSound;
        case "piapro":
          return LogoPiapro;
        case "school_refusal":
          return LogoSchoolRefusal;
        case "street":
          return LogoStreet;
        case "theme_park":
          return LogoThemePark;
      }
    },
    [charas]
  );

  const getCardImages: () => ImageDecorator[] = useCallback(
    () =>
      card
        ? card?.rarity >= 3
          ? [
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_normal.webp`,
                alt: "card normal",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_normal.webp`,
              },
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
                alt: "card normal trim",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
              },
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_after_training.webp`,
                alt: "card after training",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_after_training.webp`,
              },
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/after_training.webp`,
                alt: "card after training trim",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/after_training.webp`,
              },
            ]
          : [
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_normal.webp`,
                alt: "card normal",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_normal.webp`,
              },
              {
                src: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
                alt: "card normal",
                downloadUrl: `https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
              },
            ]
        : [],
    [card]
  );

  useEffect(() => {
    if (cards.length && rarities.length && skills.length) {
      const _card = cards.find((elem) => elem.id === Number(cardId))!;
      setCard(
        Object.assign({}, _card, {
          maxTrainedLevel: rarities.find((elem) => elem.rarity === _card.rarity)
            ?.trainingMaxLevel,
          maxNormalLevel: rarities.find((elem) => elem.rarity === _card.rarity)
            ?.maxLevel!,
        })
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
      document.title = `${_card.prefix} | ${getCharaName(
        _card.characterId
      )} | Card | Sekai Viewer`;
    }
  }, [setCard, cards, cardId, rarities, skills, getCharaName]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabVal(newValue);
  };

  return card && charaRanks.length ? (
    <Fragment>
      <TabContext value={tabVal}>
        <Paper>
          <Tabs
            value={tabVal}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="desktop"
          >
            <Tab label="Normal Image" value="0"></Tab>
            <Tab label="Normal Trim Image" value="2"></Tab>
            {card.rarity >= 3 ? (
              <Tab label="After Training Image" value="1"></Tab>
            ) : null}
            {card.rarity >= 3 ? (
              <Tab label="After Training Trim Image" value="3"></Tab>
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
                image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_normal.webp`}
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
                image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member/${card.assetbundleName}_rip/card_after_training.webp`}
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
                image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`}
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
                image={`https://sekai-res.dnaroma.eu/file/sekai-assets/character/member_cutout_trm/${card.assetbundleName}_rip/after_training.webp`}
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
            ID
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
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            Title
          </Typography>
          <Typography>{card.prefix}</Typography>
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
            Character
          </Typography>
          <Typography>{getCharaName(card.characterId)}</Typography>
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
            Unit
          </Typography>
          <img
            className={classes["unit-logo-img"]}
            src={getCharaUnitImage(card.characterId)}
            alt={getCharaUnitName(card.characterId)}
          ></img>
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
            Attribute
          </Typography>
          <img
            src={attrIconMap[card.attr]}
            alt={card.attr}
            className={classes["rarity-star-img"]}
          ></img>
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
            Available From
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
            Rarity
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
              Thumb
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="row" justify="flex-end" spacing={2}>
              <Grid item xs={12} md={6}>
                <CardThumb id={Number(cardId)} />
              </Grid>
              {card.rarity >= 3 ? (
                <Grid item xs={12} md={6}>
                  <CardThumb id={Number(cardId)} trained />
                </Grid>
              ) : null}
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
            Skill
          </Typography>
          <Typography>{card.cardSkillName}</Typography>
        </Grid>
        <Box>
          {/* <Typography>Skill level</Typography> */}
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
          {/* <Typography>{skill?.shortDescription}</Typography> */}
          <Typography>{getSkillDesc(skill!, skillLevel)}</Typography>
        </Box>
        <Divider style={{ margin: "1% 0" }} />
        <Box>
          <Typography style={{ fontWeight: 600 }}>Card Power</Typography>
          <Slider
            value={cardLevel}
            onChange={(e, value) => setCardLevel(value)}
            valueLabelDisplay="auto"
            step={1}
            min={1}
            max={card.rarity >= 3 ? card.maxTrainedLevel : card.maxNormalLevel}
            marks={
              card.rarity >= 3
                ? [
                    {
                      value: card.maxNormalLevel,
                      label: "Normal",
                    },
                    {
                      value: card.maxTrainedLevel!,
                      label: "Trained",
                    },
                  ]
                : [
                    {
                      value: card.maxNormalLevel,
                      label: "Normal",
                    },
                  ]
            }
          />
          <Grid container>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item md={3} xs={6}>
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item xs={3}>
                      <img
                        src={IconPerformance}
                        alt="performance"
                        style={{ marginRight: "7%" }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {card.cardParameters.find(
                          (elem) =>
                            elem.cardParameterType === "param1" &&
                            elem.cardLevel === cardLevel
                        )?.power! +
                          (cardLevel > card.maxNormalLevel
                            ? card.specialTrainingPower1BonusFixed
                            : 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item md={3} xs={6}>
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item xs={3}>
                      <img
                        src={IconTechnique}
                        alt="technique"
                        style={{ marginRight: "7%" }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {card.cardParameters.find(
                          (elem) =>
                            elem.cardParameterType === "param2" &&
                            elem.cardLevel === cardLevel
                        )?.power! +
                          (cardLevel > card.maxNormalLevel
                            ? card.specialTrainingPower2BonusFixed
                            : 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item md={3} xs={6}>
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item xs={3}>
                      <img
                        src={IconStamina}
                        alt="stamina"
                        style={{ marginRight: "7%" }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {card.cardParameters.find(
                          (elem) =>
                            elem.cardParameterType === "param3" &&
                            elem.cardLevel === cardLevel
                        )?.power! +
                          (cardLevel > card.maxNormalLevel
                            ? card.specialTrainingPower3BonusFixed
                            : 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item md={3} xs={6}>
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    wrap="nowrap"
                  >
                    <Grid item xs={3}>
                      <img
                        src={IconTotalStrength}
                        alt="total strength"
                        style={{ marginRight: "7%", height: "34px" }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>
                        {card.cardParameters
                          .filter((elem) => elem.cardLevel === cardLevel)
                          .reduce((sum, elem) => sum + elem.power, 0) +
                          (cardLevel > card.maxNormalLevel
                            ? card.specialTrainingPower1BonusFixed +
                              card.specialTrainingPower2BonusFixed +
                              card.specialTrainingPower3BonusFixed
                            : 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Divider style={{ margin: "1% 0" }} />
      </Grid>
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
