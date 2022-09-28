import {
  Box,
  Card,
  Divider,
  Grid,
  Paper,
  Slider,
  Tab,
  Tabs,
  Typography,
  Chip,
  styled,
} from "@mui/material";
import { TabContext } from "@mui/lab";
import React, {
  Fragment,
  useCallback,
  useEffect,
  // useMemo,
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
  IEventCard,
  IEventInfo,
  IGameChara,
  IMasterLesson,
  IMasterLessonReward,
  ISkillInfo,
  IUnitProfile,
} from "../../types.d";
import {
  cardRarityTypeToRarity,
  getRemoteAssetURL,
  // specialTrainingRarityTypes,
  useCachedData,
  useCardType,
} from "../../utils";
import rarityNormal from "../../assets/rarity_star_normal.png";
import rarityAfterTraining from "../../assets/rarity_star_afterTraining.png";
import rarityBirthday from "../../assets/rarity_birthday.png";

import { CardThumb } from "../../components/widgets/CardThumb";
import {
  attrIconMap,
  UnitLogoMiniMap,
  charaIcons,
} from "../../utils/resources";
import { useTranslation } from "react-i18next";
import MaterialIcon from "../../components/widgets/MaterialIcon";
import { useAssetI18n, useCharaName } from "../../utils/i18n";
import {
  CharaNameTrans,
  ContentTrans,
  ReleaseCondTrans,
} from "../../components/helpers/ContentTrans";
import ResourceBox from "../../components/widgets/ResourceBox";
import { AudioPlayButton } from "../storyreader/StoryReaderSnippet";
// import AdSense from "../../components/blocks/AdSense";
import { OpenInNew } from "@mui/icons-material";
import CommentTextMultiple from "~icons/mdi/comment-text-multiple";
import Comment from "../comment/Comment";
import { useStrapi } from "../../utils/apiClient";
import { useRootStore } from "../../stores/root";
import { observer } from "mobx-react-lite";
import GridOut from "../../components/styled/GridOut";
import ContainerContent from "../../components/styled/ContainerContent";
import TypographyHeader from "../../components/styled/TypographyHeader";
import TabPanelPadding from "../../components/styled/TabPanelPadding";
import CardMediaCardImg from "../../components/styled/CardMediaCardImg";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import PaperContainer from "../../components/styled/PaperContainer";
import TypographyCaption from "../../components/styled/TypographyCaption";

const ImgRarityStar = styled("img")(({ theme }) => ({
  maxWidth: "32px",
  margin: theme.spacing(0, 0.25),
}));
const BoxSliderContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingRight: theme.spacing(5),
  },
}));

interface IExtendCardInfo extends ICardInfo {
  maxTrainedLevel?: number;
  maxNormalLevel: number;
}

const CardDetail: React.FC<{}> = observer(() => {
  const { t } = useTranslation();
  const { assetT, getTranslated } = useAssetI18n();
  const {
    settings: { contentTransMode },
  } = useRootStore();
  const getCharaName = useCharaName();
  const { getCard } = useStrapi();

  const [charas] = useCachedData<IGameChara>("gameCharacters");
  const [cards] = useCachedData<ICardInfo>("cards");
  const [rarities] = useCachedData<ICardRarity>("cardRarities");
  const [episodes] = useCachedData<ICardEpisode>("cardEpisodes");
  const [charaRanks] = useCachedData<ICharacterRank>("characterRanks");
  const [skills] = useCachedData<ISkillInfo>("skills");
  const [unitProfiles] = useCachedData<IUnitProfile>("unitProfiles");
  const [eventsCache] = useCachedData<IEventInfo>("events");
  const [eventCardsCache] = useCachedData<IEventCard>("eventCards");
  const [masterLessonsCache] = useCachedData<IMasterLesson>("masterLessons");
  const [masterLessonRewardsCache] = useCachedData<IMasterLessonReward>(
    "masterLessonRewards"
  );

  const { cardId } = useParams<{ cardId: string }>();

  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [card, setCard] = useState<IExtendCardInfo>();
  const [cardTitle, setCardTitle] = useState<string>("");
  const [tabVal, setTabVal] = useState<string>("0");
  const [episodeTabVal, setEpisodeTabVal] = useState<string>("1");
  const [cardLevel, setCardLevel] = useState<number>(0);
  const [skill, setSkill] = useState<ISkillInfo>();
  const [skillLevel, setSkillLevel] = useState<number>(0);
  const [masterLessons, setMasterLessons] = useState<IMasterLesson[]>([]);
  const [masterLessonRewards, setMasterLessonRewards] = useState<
    IMasterLessonReward[]
  >([]);
  const [masterRank, setMasterRank] = useState<number>(0);
  const [cardEpisode, setCardEpisode] = useState<ICardEpisode[]>([]);
  const [sideStory1Unlocked, setSideStory1Unlocked] = useState<boolean>(true);
  const [sideStory2Unlocked, setSideStory2Unlocked] = useState<boolean>(true);
  // const [cardRank, setCardRank] = useState<number | number[]>(0);
  // const [maxCardRank, setMaxCardRank] = useState<number>(0);
  const [gachaPhraseUrl, setGachaPhraseUrl] = useState("");
  const [cardCommentId, setCardCommentId] = useState<number>(0);

  const [event, setEvent] = useState<IEventInfo>();

  const { isNewRarityCard, isBirthdayCard, isTrainableCard } =
    useCardType(card);

  const masterRankRewards = [0, 50, 100, 150, 200];

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
      const prefix = getTranslated(`card_prefix:${_card.id}`, _card.prefix);
      document.title = t("title:cardDetail", {
        prefix,
        character: getCharaName(_card.characterId),
      });
    }
  }, [cards, cardId, contentTransMode, getCharaName, assetT, getTranslated, t]);

  useEffect(() => {
    if (
      cards &&
      rarities &&
      skills &&
      episodes &&
      eventsCache &&
      eventCardsCache &&
      masterLessonsCache &&
      masterLessonRewardsCache
    ) {
      const _card = cards.find((elem) => elem.id === Number(cardId))!;
      const _rarityInfo = isNewRarityCard
        ? rarities.find(
            (rarity) => rarity.cardRarityType === _card.cardRarityType
          )
        : rarities.find((rarity) => rarity.rarity === _card.rarity);
      if (_rarityInfo) {
        setCard(
          Object.assign({}, _card, {
            maxTrainedLevel: _rarityInfo.trainingMaxLevel,
            maxNormalLevel: _rarityInfo.maxLevel,
          })
        );
        setCardLevel(_rarityInfo.trainingMaxLevel || _rarityInfo.maxLevel);
        setSkillLevel(_rarityInfo.maxSkillLevel);
        setCardTitle(
          `${getTranslated(
            `card_prefix:${_card.id}`,
            _card.prefix
          )} - ${getCharaName(_card.characterId)}`
        );
        const _skill = skills.find((elem) => elem.id === _card.skillId)!;
        setSkill(_skill);
        setCardEpisode(episodes.filter((epi) => epi.cardId === Number(cardId)));
        if (_card.gachaPhrase !== "-")
          getRemoteAssetURL(
            `sound/gacha/get_voice/${_card.assetbundleName}_rip/${_card.assetbundleName}.mp3`,
            setGachaPhraseUrl,
            window.isChinaMainland ? "cn" : "minio"
          );
      }
      const _eventCards = eventCardsCache.filter(
        (elem) => elem.cardId === Number(cardId)
      );
      if (_eventCards && _eventCards.length)
        setEvent(
          eventsCache.find((elem) => elem.id === Number(_eventCards[0].eventId))
        );

      const _masterLessons = masterLessonsCache
        .filter((mlc) =>
          _card.cardRarityType
            ? mlc.cardRarityType === _card.cardRarityType
            : mlc.cardRarity === _card.rarity
        )
        .sort((a, b) => a.masterRank - b.masterRank);
      setMasterLessons(_masterLessons);

      setMasterRank(_masterLessons.slice(-1)[0].masterRank);
      setMasterLessonRewards(
        masterLessonRewardsCache.filter((mlrc) => mlrc.cardId === _card.id)
      );
    }
  }, [
    eventsCache,
    eventCardsCache,
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
    isNewRarityCard,
    masterLessonsCache,
    masterLessonRewardsCache,
  ]);

  useEffect(() => {
    if (card) {
      const job = async () => {
        const cardStrapi = await getCard(card.id);
        if (cardStrapi) {
          setCardCommentId(cardStrapi.id);
        }
      };

      job();
    }
  }, [card, getCard]);

  const [normalImg, setNormalImg] = useState<string>("");
  const [trainedImg, setTrainedImg] = useState<string>("");
  const [normalTrimImg, setNormalTrimImg] = useState<string>("");
  const [trainedTrimImg, setTrainedTrimImg] = useState<string>("");

  useEffect(() => {
    if (card) {
      getRemoteAssetURL(
        `character/member/${card.assetbundleName}_rip/card_normal.webp`,
        setNormalImg,
        window.isChinaMainland ? "cn" : "minio"
      );
      getRemoteAssetURL(
        `character/member_cutout_trm/${card.assetbundleName}_rip/normal.webp`,
        setNormalTrimImg,
        window.isChinaMainland ? "cn" : "minio"
      );
      if (isTrainableCard) {
        getRemoteAssetURL(
          `character/member/${card.assetbundleName}_rip/card_after_training.webp`,
          setTrainedImg,
          window.isChinaMainland ? "cn" : "minio"
        );
        getRemoteAssetURL(
          `character/member_cutout_trm/${card.assetbundleName}_rip/after_training.webp`,
          setTrainedTrimImg,
          window.isChinaMainland ? "cn" : "minio"
        );
      }
    }
  }, [card, isTrainableCard]);

  const getCardImages: () => ImageDecorator[] = useCallback(
    () =>
      card
        ? isTrainableCard
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
    [
      card,
      isTrainableCard,
      normalImg,
      normalTrimImg,
      trainedImg,
      trainedTrimImg,
    ]
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
      <TypographyHeader>{cardTitle}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <TabContext value={tabVal}>
          <Paper>
            <Tabs
              value={tabVal}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons
            >
              <Tab label={t("card:tab.title[0]")} value="0"></Tab>
              <Tab label={t("card:tab.title[1]")} value="2"></Tab>
              {isTrainableCard && !isBirthdayCard ? (
                <Tab label={t("card:tab.title[2]")} value="1"></Tab>
              ) : null}
              {isTrainableCard && !isBirthdayCard ? (
                <Tab label={t("card:tab.title[3]")} value="3"></Tab>
              ) : null}
            </Tabs>
            <TabPanelPadding value="0">
              <Card
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
              >
                <CardMediaCardImg image={normalImg} />
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="1">
              <Card
                onClick={() => {
                  setActiveIdx(2);
                  setVisible(true);
                }}
              >
                <CardMediaCardImg image={trainedImg} />
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="2">
              <Card
                onClick={() => {
                  setActiveIdx(1);
                  setVisible(true);
                }}
              >
                <CardMediaCardImg
                  image={normalTrimImg}
                  sx={{ backgroundSize: "contain" }}
                />
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="3">
              <Card
                onClick={() => {
                  setActiveIdx(3);
                  setVisible(true);
                }}
              >
                <CardMediaCardImg
                  image={trainedTrimImg}
                  sx={{ backgroundSize: "contain" }}
                />
              </Card>
            </TabPanelPadding>
          </Paper>
        </TabContext>
        <GridOut container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
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
          {card.gachaPhrase !== "-" && (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("card:gachaPhrase")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <Grid item>
                      <ContentTrans
                        contentKey={`card_gacha_phrase:${card.id}`}
                        original={card.gachaPhrase}
                        originalProps={{ align: "right" }}
                        translatedProps={{ align: "right" }}
                      />
                    </Grid>
                    <Grid item>
                      <AudioPlayButton url={gachaPhraseUrl} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:character")}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <LinkNoDecoration to={"/chara/" + card.characterId}>
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Grid item>
                    <CharaNameTrans
                      characterId={card.characterId}
                      originalProps={{ align: "right" }}
                      translatedProps={{ align: "right" }}
                    />
                  </Grid>
                  <Grid item>
                    <ImgRarityStar
                      src={charaIcons[`CharaIcon${card.characterId}`]}
                      alt={getCharaName(card.characterId)}
                    ></ImgRarityStar>
                  </Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={3}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:unit")}
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <LinkNoDecoration
                to={"/unit/" + getCharaUnitName(card.characterId)}
              >
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
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
                      originalProps={{ align: "right" }}
                      translatedProps={{ align: "right" }}
                    />
                  </Grid>
                  <Grid item>
                    <ImgRarityStar
                      src={getCharaUnitImage(card.characterId)}
                      alt={getCharaUnitName(card.characterId)}
                    ></ImgRarityStar>
                  </Grid>
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {card.supportUnit !== "none" ? (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
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
                      justifyContent="flex-end"
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
                        <ImgRarityStar
                          src={UnitLogoMiniMap[card.supportUnit]}
                          alt={card.supportUnit}
                        ></ImgRarityStar>
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
            justifyContent="space-between"
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
                justifyContent="flex-end"
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
                  <ImgRarityStar
                    src={attrIconMap[card.attr]}
                    alt={card.attr}
                  ></ImgRarityStar>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          {event ? (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:event")}
                  </Typography>
                </Grid>
                <Grid item>
                  <LinkNoDecoration to={`/event/${event.id}`}>
                    <ContentTrans
                      contentKey={`event_name:${event.id}`}
                      original={event.name}
                      originalProps={{ align: "right" }}
                      translatedProps={{ align: "right" }}
                    />
                  </LinkNoDecoration>
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          ) : null}
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:rarity")}
            </Typography>
            <Typography>
              {Array.from({
                length: isBirthdayCard
                  ? 1
                  : isNewRarityCard
                  ? cardRarityTypeToRarity[card.cardRarityType!]
                  : card.rarity!,
              }).map((_, id) => (
                <ImgRarityStar
                  src={
                    isBirthdayCard
                      ? rarityBirthday
                      : cardLevel > card.maxNormalLevel
                      ? rarityAfterTraining
                      : rarityNormal
                  }
                  alt={`star-${id}`}
                  key={`star-${id}`}
                ></ImgRarityStar>
              ))}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:thumb")}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Grid
                container
                direction="row"
                justifyContent="flex-end"
                spacing={2}
              >
                <Grid item xs={12} sm={6} md={5} lg={4}>
                  <CardThumb cardId={Number(cardId)} />
                </Grid>
                {isTrainableCard && !isBirthdayCard ? (
                  <Grid item xs={12} sm={6} md={5} lg={4}>
                    <CardThumb cardId={Number(cardId)} trained />
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </GridOut>
      </ContainerContent>
      {!!skill && (
        <Fragment>
          <TypographyHeader>{t("common:skill")}</TypographyHeader>
          <ContainerContent maxWidth="md">
            <PaperContainer>
              <Grid container direction="column" spacing={1}>
                <Grid
                  item
                  container
                  xs={12}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item xs={12} md={2}>
                    <TypographyCaption>
                      {t("card:skillLevel")}
                    </TypographyCaption>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <BoxSliderContainer>
                      <Slider
                        value={skillLevel}
                        onChange={(e, value) => setSkillLevel(value as number)}
                        valueLabelDisplay="auto"
                        step={1}
                        min={1}
                        max={
                          skill!.skillEffects[0].skillEffectDetails[
                            skill!.skillEffects[0].skillEffectDetails.length - 1
                          ].level
                        }
                      />
                    </BoxSliderContainer>
                  </Grid>
                </Grid>
              </Grid>
            </PaperContainer>
            <GridOut container direction="column">
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
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
                justifyContent="space-between"
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
            </GridOut>
          </ContainerContent>
        </Fragment>
      )}
      <TypographyHeader>{t("card:masterRank")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <PaperContainer>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={12} md={2}>
                <TypographyCaption>
                  {t("card:masterRankLevel")}
                </TypographyCaption>
              </Grid>
              <Grid item xs={12} md={9}>
                <BoxSliderContainer>
                  <Slider
                    value={masterRank}
                    onChange={(e, value) => setMasterRank(value as number)}
                    valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={masterLessons.slice(-1)[0].masterRank}
                  />
                </BoxSliderContainer>
              </Grid>
            </Grid>
          </Grid>
        </PaperContainer>
        <GridOut container direction="column">
          {masterRank > 0 && (
            <Fragment>
              <Grid
                container
                direction="row"
                wrap="nowrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("common:cost")}
                  </Typography>
                </Grid>
                <Grid item xs={9} container justifyContent="flex-end">
                  {masterLessons
                    .find((ml) => ml.masterRank === masterRank)!
                    .costs.map((c, idx) => (
                      <Grid key={`master-rank-cost-${idx}`} item>
                        <MaterialIcon
                          materialId={c.resourceId}
                          quantity={c.quantity}
                          justify="center"
                        />
                      </Grid>
                    ))}
                </Grid>
              </Grid>
              <Divider style={{ margin: "1% 0" }} />
            </Fragment>
          )}
          {!!masterLessonRewards.length &&
            !!masterLessonRewards.find(
              (mlr) => mlr.masterRank === masterRank
            ) && (
              <Fragment>
                <Grid
                  container
                  direction="row"
                  wrap="nowrap"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("common:rewards")}
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <ResourceBox
                      resourceBoxId={
                        masterLessonRewards.find(
                          (mlr) => mlr.masterRank === masterRank
                        )!.resourceBoxId
                      }
                      resourceBoxPurpose="master_lesson_reward"
                      justifyContent="flex-end"
                    />
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1% 0" }} />
              </Fragment>
            )}
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("card:stats")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <PaperContainer>
          <Grid container direction="column" spacing={1}>
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={12} md={2}>
                <TypographyCaption>{t("card:cardLevel")}</TypographyCaption>
              </Grid>
              <Grid item xs={12} md={9}>
                <BoxSliderContainer>
                  <Slider
                    value={cardLevel}
                    onChange={(e, value) => setCardLevel(value as number)}
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={
                      isTrainableCard && !isBirthdayCard
                        ? card.maxTrainedLevel
                        : card.maxNormalLevel
                    }
                    marks={
                      isTrainableCard && !isBirthdayCard
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
                </BoxSliderContainer>
              </Grid>
            </Grid>
            {!!cardEpisode.length && (
              <Grid
                item
                container
                xs={12}
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item xs={12} md={2}>
                  <TypographyCaption>{t("card:sideStory")}</TypographyCaption>
                </Grid>
                <Grid item container xs={12} md={9} spacing={1}>
                  {!!cardEpisode[0] && (
                    <Grid item>
                      <Chip
                        clickable
                        color={sideStory1Unlocked ? "primary" : "default"}
                        label={t("card:sideStory1Unlocked")}
                        onClick={() => setSideStory1Unlocked((v) => !v)}
                      />
                    </Grid>
                  )}
                  {!!cardEpisode[1] && (
                    <Grid item>
                      <Chip
                        clickable
                        color={sideStory2Unlocked ? "primary" : "default"}
                        label={t("card:sideStory2Unlocked")}
                        onClick={() => setSideStory2Unlocked((v) => !v)}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>
        </PaperContainer>
        <GridOut container direction="column">
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
                (sideStory1Unlocked && cardEpisode[0]
                  ? cardEpisode[0].power1BonusFixed
                  : 0) +
                (sideStory2Unlocked && cardEpisode[1]
                  ? cardEpisode[1].power1BonusFixed
                  : 0) +
                masterRank *
                  masterRankRewards[
                    isNewRarityCard
                      ? cardRarityTypeToRarity[card.cardRarityType!]
                      : card.rarity!
                  ]}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
                (sideStory1Unlocked && cardEpisode[0]
                  ? cardEpisode[0].power2BonusFixed
                  : 0) +
                (sideStory2Unlocked && cardEpisode[1]
                  ? cardEpisode[1].power2BonusFixed
                  : 0) +
                masterRank *
                  masterRankRewards[
                    isNewRarityCard
                      ? cardRarityTypeToRarity[card.cardRarityType!]
                      : card.rarity!
                  ]}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
                (sideStory1Unlocked && cardEpisode[0]
                  ? cardEpisode[0].power3BonusFixed
                  : 0) +
                (sideStory2Unlocked && cardEpisode[1]
                  ? cardEpisode[1].power3BonusFixed
                  : 0) +
                masterRank *
                  masterRankRewards[
                    isNewRarityCard
                      ? cardRarityTypeToRarity[card.cardRarityType!]
                      : card.rarity!
                  ]}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
          <Grid
            container
            direction="row"
            wrap="nowrap"
            justifyContent="space-between"
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
                (sideStory1Unlocked && cardEpisode[0]
                  ? cardEpisode[0].power1BonusFixed +
                    cardEpisode[0].power2BonusFixed +
                    cardEpisode[0].power3BonusFixed
                  : 0) +
                (sideStory2Unlocked && cardEpisode[1]
                  ? cardEpisode[1].power1BonusFixed +
                    cardEpisode[1].power2BonusFixed +
                    cardEpisode[1].power3BonusFixed
                  : 0) +
                masterRank *
                  masterRankRewards[
                    isNewRarityCard
                      ? cardRarityTypeToRarity[card.cardRarityType!]
                      : card.rarity!
                  ] *
                  3}
            </Typography>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </GridOut>
      </ContainerContent>
      {/* <AdSense
        client="ca-pub-7767752375383260"
        slot="8221864477"
        format="auto"
        responsive="true"
      /> */}
      {!!cardEpisode.length && (
        <Fragment>
          <TypographyHeader>
            {t("card:sideStory", { count: cardEpisode.length })}
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <TabContext value={episodeTabVal}>
              <PaperContainer>
                <Tabs
                  value={episodeTabVal}
                  onChange={(e, v) => setEpisodeTabVal(v)}
                  variant="scrollable"
                  scrollButtons
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
              </PaperContainer>
              <TabPanelPadding value="1">
                <Grid container direction="column">
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:releaseCondition")}
                      </Typography>
                    </Grid>
                    <Grid item xs={8} container justifyContent="flex-end">
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
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:releaseCosts")}
                      </Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Grid container spacing={1} justifyContent="flex-end">
                        {cardEpisode[0].costs.map((c, idx) => (
                          <Grid key={`episode-cost-${idx}`} item>
                            <MaterialIcon
                              materialId={c.resourceId}
                              quantity={c.quantity}
                              justify="center"
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:rewards")}
                      </Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Grid container spacing={1} justifyContent="flex-end">
                        {(cardEpisode[0].rewardResourceBoxIds || [3]).map(
                          (id) => (
                            <Grid key={`episode-reward-${id}`} item>
                              <ResourceBox
                                resourceBoxId={id}
                                resourceBoxPurpose="episode_reward"
                                justifyContent="center"
                                key={id}
                              />
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={8}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:storyReader")}
                      </Typography>
                    </Grid>
                    <Grid item container justifyContent="flex-end">
                      <LinkNoDecoration
                        to={`/storyreader/cardStory/${card.characterId}/${card.id}/${cardEpisode[0].id}`}
                      >
                        <Grid container alignItems="center">
                          <OpenInNew />
                        </Grid>
                      </LinkNoDecoration>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                </Grid>
              </TabPanelPadding>
              <TabPanelPadding value="2">
                <Grid container direction="column">
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:releaseCondition")}
                      </Typography>
                    </Grid>
                    <Grid item xs={8} container justifyContent="flex-end">
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
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:releaseCosts")}
                      </Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Grid container spacing={1} justifyContent="flex-end">
                        {cardEpisode[1].costs.map((c, idx) => (
                          <Grid key={`episode-cost-${idx}`} item>
                            <MaterialIcon
                              materialId={c.resourceId}
                              quantity={c.quantity}
                              justify="center"
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:rewards")}
                      </Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Grid container spacing={1} justifyContent="flex-end">
                        {(cardEpisode[1].rewardResourceBoxIds || [4]).map(
                          (id) => (
                            <Grid key={`episode-reward-${id}`} item>
                              <ResourceBox
                                resourceBoxId={id}
                                resourceBoxPurpose="episode_reward"
                                justifyContent="center"
                                key={id}
                              />
                            </Grid>
                          )
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                  <Grid
                    container
                    direction="row"
                    wrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item xs={8}>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {t("common:storyReader")}
                      </Typography>
                    </Grid>
                    <Grid item container justifyContent="flex-end">
                      <LinkNoDecoration
                        to={`/storyreader/cardStory/${card.characterId}/${card.id}/${cardEpisode[1].id}`}
                      >
                        <Grid container alignItems="center">
                          <OpenInNew />
                        </Grid>
                      </LinkNoDecoration>
                    </Grid>
                  </Grid>
                  <Divider style={{ margin: "1% 0" }} />
                </Grid>
              </TabPanelPadding>
            </TabContext>
          </ContainerContent>
        </Fragment>
      )}
      {!!cardCommentId && (
        <Fragment>
          <TypographyHeader>
            {t("common:comment")} <CommentTextMultiple />
          </TypographyHeader>
          <ContainerContent maxWidth="md">
            <Comment contentType="cards" contentId={cardCommentId} />
          </ContainerContent>
        </Fragment>
      )}
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
});

export default CardDetail;
