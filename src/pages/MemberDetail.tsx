import {
  Card,
  CardMedia,
  Divider,
  Grid,
  Paper,
  styled,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { TabContext } from "@mui/lab";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Viewer from "react-viewer";
import {
  IGameChara,
  ICharaUnitInfo,
  ICharaProfile,
  ICardInfo,
  IUnitProfile,
} from "../types.d";
import { getRemoteAssetURL, useCachedData } from "../utils";
import { UnitLogoMap } from "../utils/resources";
import { CardThumb } from "../components/widgets/CardThumb";
import ColorPreview from "../components/helpers/ColorPreview";
import {
  CharaNameTrans,
  ContentTrans,
} from "../components/helpers/ContentTrans";
import { OpenInNew } from "@mui/icons-material";
import { useCharaName } from "../utils/i18n";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../stores/root";
import TypographyHeader from "../components/styled/TypographyHeader";
import ContainerContent from "../components/styled/ContainerContent";
import GridOut from "../components/styled/GridOut";
import LinkNoDecoration from "../components/styled/LinkNoDecoration";
import TabPanelPadding from "../components/styled/TabPanelPadding";

const MemberDetail: React.FC<{}> = observer(() => {
  const { charaId } = useParams<{ charaId: string }>();
  const { t } = useTranslation();
  const getCharaName = useCharaName();
  const { region } = useRootStore();

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
      setCharaTrimImg,
      window.isChinaMainland ? "cn" : "minio",
      region
    );
    getRemoteAssetURL(
      `character/label_rip/chr_h_lb_${charaId}.webp`,
      setCharaLabelHImg,
      window.isChinaMainland ? "cn" : "minio",
      region
    );
    getRemoteAssetURL(
      `character/label_vertical_rip/chr_v_lb_${charaId}.webp`,
      setCharaLabelVImg,
      window.isChinaMainland ? "cn" : "minio",
      region
    );
  }, [charaId, region]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTabVal(newValue);
  };

  const UnitLogoImg = styled("img")`
    max-height: 64px;
  `;

  const UnitLogoLargeImg = styled("img")`
    max-height: 64px;
    max-width: 100%;
  `;

  return chara && charaUnit && charaProfile && charaCards.length ? (
    <Fragment>
      <TypographyHeader>{getCharaName(Number(charaId))}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <TabContext value={tabVal}>
          <Paper>
            <Tabs
              value={tabVal}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons
            >
              <Tab label={t("member:tab.title[0]")} value="0"></Tab>
              <Tab label={t("member:tab.title[1]")} value="1"></Tab>
              <Tab label={t("member:tab.title[2]")} value="2"></Tab>
            </Tabs>
            <TabPanelPadding value="0">
              <Card
                onClick={() => {
                  setActiveIdx(0);
                  setVisible(true);
                }}
              >
                <CardMedia
                  sx={{
                    paddingTop: "70%",
                    cursor: "pointer",
                  }}
                  image={charaTrimImg}
                ></CardMedia>
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="1">
              <Card>
                <CardMedia
                  sx={{
                    paddingTop: "30%",
                    backgroundSize: "contain",
                  }}
                  image={charaLabelHImg}
                ></CardMedia>
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="2">
              <Card>
                <CardMedia
                  sx={{
                    paddingTop: "45%",
                    backgroundSize: "contain",
                  }}
                  image={charaLabelVImg}
                ></CardMedia>
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
            <Typography variant="subtitle1" fontWeight={600}>
              {t("common:id")}
            </Typography>
            <Typography>{chara.id}</Typography>
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
              <Typography variant="subtitle1" fontWeight={600}>
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
            justifyContent="space-between"
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
            justifyContent="space-between"
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t("common:unit")}
            </Typography>
            <Link to={"/unit/" + chara.unit}>
              <UnitLogoImg
                src={UnitLogoMap[region][chara.unit]}
                alt={chara.unit}
              />
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
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={3}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                    {t("member:" + key)}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Grid container spacing={1} justifyContent="flex-end">
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
        </GridOut>
      </ContainerContent>
      <TypographyHeader>{t("common:profile")}</TypographyHeader>
      <ContainerContent maxWidth="md">
        <GridOut container direction="column">
          {Object.keys(charaProfile)
            .filter((key) => !["characterId", "scenarioId"].includes(key))
            .map((key) => (
              <Fragment key={key}>
                <Grid
                  container
                  direction="row"
                  wrap="nowrap"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {t("member:" + key)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={8}>
                    <Grid container justifyContent="flex-end">
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={8}>
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("member:scenario")}
              </Typography>
            </Grid>
            <Grid item container justifyContent="flex-end">
              <LinkNoDecoration
                to={`/storyreader/charaStory/${charaProfile.characterId}`}
              >
                <Grid container alignItems="center">
                  <OpenInNew />
                </Grid>
              </LinkNoDecoration>
            </Grid>
          </Grid>
          <Divider style={{ margin: "1% 0" }} />
        </GridOut>
      </ContainerContent>
      {charaSupportUnits.length ? (
        <Fragment>
          <TypographyHeader>{t("common:support_unit")}</TypographyHeader>
          <ContainerContent>
            <GridOut
              container
              direction="row"
              justifyContent="center"
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
                          <UnitLogoLargeImg
                            src={UnitLogoMap[region][csu.unit]}
                            alt={csu.unit}
                          ></UnitLogoLargeImg>
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
            </GridOut>
          </ContainerContent>
        </Fragment>
      ) : null}
      <TypographyHeader>{t("common:card")}</TypographyHeader>
      <ContainerContent maxWidth="lg">
        <GridOut container direction="row" spacing={2}>
          {charaCards.map((cc) => (
            <Grid item xs={4} md={2} lg={1} key={"card-" + cc.id}>
              <Link to={"/card/" + cc.id} style={{ textDecoration: "none" }}>
                <CardThumb cardId={cc.id}></CardThumb>
              </Link>
            </Grid>
          ))}
        </GridOut>
      </ContainerContent>
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
});

export default MemberDetail;
