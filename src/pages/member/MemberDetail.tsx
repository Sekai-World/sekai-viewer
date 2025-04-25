import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  styled,
  Tab,
  Tabs,
  Tooltip,
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
  ICostume3D,
  ServerRegion,
  ICompactCostume3D,
} from "../../types.d";
import { getRemoteAssetURL, useCachedData, useCompactData } from "../../utils";
import { UnitLogoMap } from "../../utils/resources";
import { CardThumb } from "../../components/widgets/CardThumb";
import ColorPreview from "../../components/helpers/ColorPreview";
import {
  CharaNameTrans,
  ContentTrans,
} from "../../components/helpers/ContentTrans";
import { ExpandMore, OpenInNew } from "@mui/icons-material";
import { useCharaName } from "../../utils/i18n";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../stores/root";
import TypographyHeader from "../../components/styled/TypographyHeader";
import ContainerContent from "../../components/styled/ContainerContent";
import GridOut from "../../components/styled/GridOut";
import LinkNoDecoration from "../../components/styled/LinkNoDecoration";
import TabPanelPadding from "../../components/styled/TabPanelPadding";
import ImageWrapper from "../../components/helpers/ImageWrapper";

const UnitLogoImg = styled("img")`
  max-height: 64px;
`;

const UnitLogoLargeImg = styled("img")`
  max-height: 64px;
  max-width: 100%;
`;

const MemberCostumeDialog: React.FC<
  { costumes: ICostume3D[]; region: ServerRegion } & DialogProps
> = ({ costumes, region, open = false, ...props }) => {
  return costumes.length ? (
    <Dialog open={open} fullWidth maxWidth="sm" {...props}>
      <DialogTitle>{costumes[0].name}</DialogTitle>
      <DialogContent>
        <GridOut container direction="row" spacing={2}>
          {costumes.map((cc) => (
            <Grid item xs={3} md={2} key={"costume-" + cc.id}>
              <ImageWrapper
                src={`thumbnail/costume/${cc.assetbundleName}.webp`}
                region={region}
              />
            </Grid>
          ))}
        </GridOut>
      </DialogContent>
    </Dialog>
  ) : null;
};

const MemberCostumeAccordion: React.FC<{
  charaId: number;
  region: ServerRegion;
}> = ({ charaId, region }) => {
  const { t } = useTranslation();

  const [costume3ds] = useCachedData<ICostume3D>("costume3ds");
  const [compactCostume3ds] =
    useCompactData<ICompactCostume3D>("compactCostume3ds");

  const [charaCostumes, setCharaCostumes] = useState<ICostume3D[]>([]);
  const [isMemberCostumeOpen, setIsMemberCostumeOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogCostumes, setDialogCostumes] = useState<ICostume3D[]>([]);

  useEffect(() => {
    if (compactCostume3ds) {
      const costumes: ICostume3D[] = [];
      compactCostume3ds.characterId.forEach((id, idx) => {
        if (
          id === charaId &&
          compactCostume3ds.__ENUM__.partType[
            compactCostume3ds.partType[idx]
          ] === "body"
        ) {
          costumes.push({
            id: compactCostume3ds.id[idx],
            seq: compactCostume3ds.seq[idx],
            costume3dGroupId: compactCostume3ds.costume3dGroupId[idx],
            costume3dType:
              compactCostume3ds.__ENUM__.costume3dType[
                compactCostume3ds.costume3dType[idx]
              ],
            name: compactCostume3ds.name[idx],
            partType:
              compactCostume3ds.__ENUM__.partType[
                compactCostume3ds.partType[idx]
              ],
            colorId: compactCostume3ds.colorId[idx],
            colorName: compactCostume3ds.colorName[idx],
            characterId: charaId,
            costume3dRarity:
              compactCostume3ds.__ENUM__.costume3dRarity[
                compactCostume3ds.costume3dRarity[idx]
              ],
            assetbundleName: compactCostume3ds.assetbundleName[idx],
            designer: compactCostume3ds.designer[idx],
            publishedAt: compactCostume3ds.publishedAt[idx] || 0,
            archiveDisplayType:
              compactCostume3ds.archiveDisplayType[idx] !== null
                ? compactCostume3ds.__ENUM__.archiveDisplayType[
                    compactCostume3ds.archiveDisplayType[idx]
                  ]
                : "",
            archivePublishedAt: compactCostume3ds.archivePublishedAt[idx] || 0,
          });
        }
      });
      setCharaCostumes(costumes);
    } else if (costume3ds?.length) {
      setCharaCostumes(
        costume3ds.filter(
          (c3d) => c3d.characterId === charaId && c3d.partType === "body"
        )
      );
    }
  }, [charaId, costume3ds, compactCostume3ds]);

  return (
    <Fragment>
      <Accordion
        expanded={isMemberCostumeOpen}
        onChange={(e, state) => setIsMemberCostumeOpen(state)}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <TypographyHeader>{t("common:costume")}</TypographyHeader>
        </AccordionSummary>
        <AccordionDetails>
          <GridOut container direction="row" spacing={2}>
            {charaCostumes
              .filter((cc) => cc.colorId === 1)
              .map((cc) => (
                <Grid item xs={3} md={2} lg={1} key={"costume-" + cc.id}>
                  <Tooltip title={cc.name} placement="top">
                    <Box
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsDialogOpen(true);
                        setDialogCostumes(
                          charaCostumes.filter(
                            (c3d) =>
                              cc.costume3dGroupId === c3d.costume3dGroupId
                          )
                        );
                      }}
                    >
                      <ImageWrapper
                        src={`thumbnail/costume/${cc.assetbundleName}.webp`}
                        region={region}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
          </GridOut>
        </AccordionDetails>
      </Accordion>
      <MemberCostumeDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogCostumes([]);
        }}
        costumes={dialogCostumes}
        region={region}
      />
    </Fragment>
  );
};

const MemberHairAccordion: React.FC<{
  charaId: number;
  region: ServerRegion;
}> = ({ charaId, region }) => {
  const { t } = useTranslation();

  const [costume3ds] = useCachedData<ICostume3D>("costume3ds");
  const [compactCostume3ds] =
    useCompactData<ICompactCostume3D>("compactCostume3ds");

  const [charaCostumes, setCharaCostumes] = useState<ICostume3D[]>([]);
  const [isMemberCostumeOpen, setIsMemberCostumeOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogCostumes, setDialogCostumes] = useState<ICostume3D[]>([]);

  useEffect(() => {
    if (compactCostume3ds) {
      const costumes: ICostume3D[] = [];
      compactCostume3ds.characterId.forEach((id, idx) => {
        if (
          id === charaId &&
          compactCostume3ds.__ENUM__.partType[
            compactCostume3ds.partType[idx]
          ] === "hair"
        ) {
          costumes.push({
            id: compactCostume3ds.id[idx],
            seq: compactCostume3ds.seq[idx],
            costume3dGroupId: compactCostume3ds.costume3dGroupId[idx],
            costume3dType:
              compactCostume3ds.__ENUM__.costume3dType[
                compactCostume3ds.costume3dType[idx]
              ],
            name: compactCostume3ds.name[idx],
            partType:
              compactCostume3ds.__ENUM__.partType[
                compactCostume3ds.partType[idx]
              ],
            colorId: compactCostume3ds.colorId[idx],
            colorName: compactCostume3ds.colorName[idx],
            characterId: charaId,
            costume3dRarity:
              compactCostume3ds.__ENUM__.costume3dRarity[
                compactCostume3ds.costume3dRarity[idx]
              ],
            assetbundleName: compactCostume3ds.assetbundleName[idx],
            designer: compactCostume3ds.designer[idx],
            publishedAt: compactCostume3ds.publishedAt[idx] || 0,
            archiveDisplayType:
              compactCostume3ds.archiveDisplayType[idx] !== null
                ? compactCostume3ds.__ENUM__.archiveDisplayType[
                    compactCostume3ds.archiveDisplayType[idx]
                  ]
                : "",
            archivePublishedAt: compactCostume3ds.archivePublishedAt[idx] || 0,
          });
        }
      });
      setCharaCostumes(costumes);
    } else if (costume3ds?.length) {
      setCharaCostumes(
        costume3ds.filter(
          (c3d) => c3d.characterId === charaId && c3d.partType === "hair"
        )
      );
    }
  }, [charaId, costume3ds, compactCostume3ds]);

  return (
    <Fragment>
      <Accordion
        expanded={isMemberCostumeOpen}
        onChange={(e, state) => setIsMemberCostumeOpen(state)}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <TypographyHeader>{t("common:hair")}</TypographyHeader>
        </AccordionSummary>
        <AccordionDetails>
          <GridOut container direction="row" spacing={2}>
            {charaCostumes
              .filter((cc) => cc.colorId === 1)
              .map((cc) => (
                <Grid item xs={3} md={2} lg={1} key={"costume-" + cc.id}>
                  <Tooltip title={cc.name} placement="top">
                    <Box
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsDialogOpen(true);
                        setDialogCostumes(
                          charaCostumes.filter(
                            (c3d) =>
                              cc.costume3dGroupId === c3d.costume3dGroupId
                          )
                        );
                      }}
                    >
                      <ImageWrapper
                        src={`thumbnail/costume/${cc.assetbundleName}.webp`}
                        region={region}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
          </GridOut>
        </AccordionDetails>
      </Accordion>
      <MemberCostumeDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogCostumes([]);
        }}
        costumes={dialogCostumes}
        region={region}
      />
    </Fragment>
  );
};

const MemberHeadAccordion: React.FC<{
  charaId: number;
  region: ServerRegion;
}> = ({ charaId, region }) => {
  const { t } = useTranslation();

  const [costume3ds] = useCachedData<ICostume3D>("costume3ds");
  const [compactCostume3ds] =
    useCompactData<ICompactCostume3D>("compactCostume3ds");

  const [charaCostumes, setCharaCostumes] = useState<ICostume3D[]>([]);
  const [isMemberCostumeOpen, setIsMemberCostumeOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogCostumes, setDialogCostumes] = useState<ICostume3D[]>([]);

  useEffect(() => {
    if (compactCostume3ds) {
      const costumes: ICostume3D[] = [];
      compactCostume3ds.characterId.forEach((id, idx) => {
        if (
          id === charaId &&
          compactCostume3ds.__ENUM__.partType[
            compactCostume3ds.partType[idx]
          ] === "head"
        ) {
          costumes.push({
            id: compactCostume3ds.id[idx],
            seq: compactCostume3ds.seq[idx],
            costume3dGroupId: compactCostume3ds.costume3dGroupId[idx],
            costume3dType:
              compactCostume3ds.__ENUM__.costume3dType[
                compactCostume3ds.costume3dType[idx]
              ],
            name: compactCostume3ds.name[idx],
            partType:
              compactCostume3ds.__ENUM__.partType[
                compactCostume3ds.partType[idx]
              ],
            colorId: compactCostume3ds.colorId[idx],
            colorName: compactCostume3ds.colorName[idx],
            characterId: charaId,
            costume3dRarity:
              compactCostume3ds.__ENUM__.costume3dRarity[
                compactCostume3ds.costume3dRarity[idx]
              ],
            assetbundleName: compactCostume3ds.assetbundleName[idx],
            designer: compactCostume3ds.designer[idx],
            publishedAt: compactCostume3ds.publishedAt[idx] || 0,
            archiveDisplayType:
              compactCostume3ds.archiveDisplayType[idx] !== null
                ? compactCostume3ds.__ENUM__.archiveDisplayType[
                    compactCostume3ds.archiveDisplayType[idx]
                  ]
                : "",
            archivePublishedAt: compactCostume3ds.archivePublishedAt[idx] || 0,
          });
        }
      });
      setCharaCostumes(costumes);
    } else if (costume3ds?.length) {
      setCharaCostumes(
        costume3ds.filter(
          (c3d) => c3d.characterId === charaId && c3d.partType === "head"
        )
      );
    }
  }, [charaId, costume3ds, compactCostume3ds]);

  return (
    <Fragment>
      <Accordion
        expanded={isMemberCostumeOpen}
        onChange={(e, state) => setIsMemberCostumeOpen(state)}
        slotProps={{ transition: { unmountOnExit: true } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <TypographyHeader>{t("common:head")}</TypographyHeader>
        </AccordionSummary>
        <AccordionDetails>
          <GridOut container direction="row" spacing={2}>
            {charaCostumes
              .filter((cc) => cc.colorId === 1)
              .map((cc) => (
                <Grid item xs={3} md={2} lg={1} key={"costume-" + cc.id}>
                  <Tooltip title={cc.name} placement="top">
                    <Box
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setIsDialogOpen(true);
                        setDialogCostumes(
                          charaCostumes.filter(
                            (c3d) =>
                              cc.costume3dGroupId === c3d.costume3dGroupId
                          )
                        );
                      }}
                    >
                      <ImageWrapper
                        src={`thumbnail/costume/${cc.assetbundleName}.webp`}
                        region={region}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
          </GridOut>
        </AccordionDetails>
      </Accordion>
      <MemberCostumeDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogCostumes([]);
        }}
        costumes={dialogCostumes}
        region={region}
      />
    </Fragment>
  );
};

const MemberDetail: React.FC<unknown> = observer(() => {
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
  const [isMemberCardOpen, setIsMemberCardOpen] = useState(false);
  const [tabVal, setTabVal] = useState<string>("0");
  const [visible, setVisible] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    if (charas?.length) {
      const chara = charas.find((c) => c.id === Number(charaId));
      setChara(chara);
    }
  }, [charas, charaId]);

  useEffect(() => {
    if (chara && charaUnits?.length) {
      setCharaUnit(
        charaUnits.find(
          (cu) => cu.gameCharacterId === chara.id && cu.unit === chara.unit
        )
      );
    }
  }, [chara, charaUnits]);

  useEffect(() => {
    if (
      chara?.unit === "piapro" &&
      charaUnits?.length &&
      unitProfiles?.length &&
      charaCards.length
    ) {
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
  }, [chara, charaUnits, charaCards, unitProfiles]);

  useEffect(() => {
    if (chara && charaProfiles && charaProfiles.length) {
      setCharaProfile(charaProfiles.find((cp) => cp.characterId === chara.id));
    }
  }, [chara, charaProfiles]);

  useEffect(() => {
    if (chara && cards && cards.length) {
      const charaCards = cards.filter((card) => card.characterId === chara.id);
      setCharaCards(charaCards);
    }
  }, [chara, cards]);

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
      `character/character_trim/chr_trim_${charaId}.webp`,
      setCharaTrimImg,
      "minio",
      region
    );
    getRemoteAssetURL(
      `character/label/chr_h_lb_${charaId}.webp`,
      setCharaLabelHImg,
      "minio",
      region
    );
    getRemoteAssetURL(
      `character/label_vertical/chr_v_lb_${charaId}.webp`,
      setCharaLabelVImg,
      "minio",
      region
    );
  }, [charaId, region]);

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: string
  ) => {
    setTabVal(newValue);
  };

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
                    cursor: "pointer",
                    paddingTop: "70%",
                  }}
                  image={charaTrimImg}
                ></CardMedia>
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="1">
              <Card>
                <CardMedia
                  sx={{
                    backgroundSize: "contain",
                    paddingTop: "30%",
                  }}
                  image={charaLabelHImg}
                ></CardMedia>
              </Card>
            </TabPanelPadding>
            <TabPanelPadding value="2">
              <Card>
                <CardMedia
                  sx={{
                    backgroundSize: "contain",
                    paddingTop: "45%",
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
      <TypographyHeader>{t("member:gameData")}</TypographyHeader>
      <ContainerContent maxWidth="lg">
        <Accordion
          expanded={isMemberCardOpen}
          onChange={(e, state) => setIsMemberCardOpen(state)}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <TypographyHeader>{t("common:card")}</TypographyHeader>
          </AccordionSummary>
          <AccordionDetails>
            <GridOut container direction="row" spacing={2}>
              {charaCards.map((cc) => (
                <Grid item xs={4} md={2} lg={1} key={"card-" + cc.id}>
                  <Link
                    to={"/card/" + cc.id}
                    style={{ textDecoration: "none" }}
                  >
                    <CardThumb cardId={cc.id}></CardThumb>
                  </Link>
                </Grid>
              ))}
            </GridOut>
          </AccordionDetails>
        </Accordion>
        <MemberCostumeAccordion charaId={chara.id} region={region} />
        <MemberHairAccordion charaId={chara.id} region={region} />
        <MemberHeadAccordion charaId={chara.id} region={region} />
      </ContainerContent>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[
          {
            alt: t("member:tab.title[0]"),
            src: charaTrimImg,
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
