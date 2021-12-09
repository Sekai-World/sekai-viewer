import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  // Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  // InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "mui-image";
import { charaIcons } from "../../../utils/resources";
import DegreeImage from "../../../components/widgets/DegreeImage";
import { getRemoteAssetURL, useCachedData, useToggle } from "../../../utils";
import {
  IArea,
  IAreaItem,
  IMusicInfo,
  UserMusic,
  UserMusicDifficultyStatus,
} from "../../../types.d";
import { useAssetI18n } from "../../../utils/i18n";

import BtnDifficultyEasy from "../../../assets/music/btn_difficulty_easy.png";
import BtnDifficultyNormal from "../../../assets/music/btn_difficulty_normal.png";
import BtnDifficultyHard from "../../../assets/music/btn_difficulty_hard.png";
import BtnDifficultyExpert from "../../../assets/music/btn_difficulty_expert.png";
import BtnDifficultyMaster from "../../../assets/music/btn_difficulty_master.png";

import IconNotClear from "../../../assets/music/icon_notClear.png";
import IconClear from "../../../assets/music/icon_clear.png";
import IconFullCombo from "../../../assets/music/icon_fullCombo.png";
import IconAllPerfect from "../../../assets/music/icon_allPerfect.png";
import { ExpandMore } from "@mui/icons-material";
import { useLayoutStyles } from "../../../styles/layout";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../../stores/root";
import { ISekaiProfile } from "../../../stores/sekai";
import { autorun } from "mobx";

const ProfileMusicImage: React.FC<{
  assetbundleName: string;
  title: string;
}> = observer(({ assetbundleName, title }) => {
  const [img, setImg] = useState<string>("");

  useEffect(() => {
    getRemoteAssetURL(
      `music/jacket/${assetbundleName}_rip/${assetbundleName}.webp`,
      setImg
    );
  }, [assetbundleName]);

  return <Image src={img} alt={title} bgColor="" showLoading></Image>;
});

const getMusicClearIcon = (status: UserMusicDifficultyStatus) => {
  const isClear = status.userMusicResults.reduce(
    (sum, elem) => sum || elem.playResult === "clear",
    false
  );
  const isFullCombo = status.userMusicResults.reduce(
    (sum, elem) => sum || elem.fullComboFlg,
    false
  );
  const isAllPerfect = status.userMusicResults.reduce(
    (sum, elem) => sum || elem.fullPerfectFlg,
    false
  );

  if (!isClear && !isFullCombo && !isAllPerfect) return IconNotClear;
  else if (isClear && !isFullCombo && !isAllPerfect) return IconClear;
  else if (isFullCombo && !isAllPerfect) return IconFullCombo;
  else if (isFullCombo && isAllPerfect) return IconAllPerfect;
};

const getClearCount = (idx: number, userMusics?: UserMusic[]) => {
  if (!userMusics) return 0;
  return userMusics.reduce((sum, umusic) => {
    const status = umusic.userMusicDifficultyStatuses[idx];
    const isClear = status.userMusicResults.reduce(
      (sum, elem) => sum || elem.playResult === "clear",
      false
    );
    const isFullCombo = status.userMusicResults.reduce(
      (sum, elem) => sum || elem.fullComboFlg,
      false
    );
    const isAllPerfect = status.userMusicResults.reduce(
      (sum, elem) => sum || elem.fullPerfectFlg,
      false
    );

    return sum + Number(isClear || isFullCombo || isAllPerfect);
  }, 0);
};

const getFullComboCount = (idx: number, userMusics?: UserMusic[]) => {
  if (!userMusics) return 0;
  return userMusics.reduce((sum, umusic) => {
    const status = umusic.userMusicDifficultyStatuses[idx];
    const isFullCombo = status.userMusicResults.reduce(
      (sum, elem) =>
        sum ||
        elem.playResult === "full_combo" ||
        elem.playResult === "full_perfect",
      false
    );

    return sum + Number(isFullCombo);
  }, 0);
};

const getAllPerfectCount = (idx: number, userMusics?: UserMusic[]) => {
  if (!userMusics) return 0;
  return userMusics.reduce((sum, umusic) => {
    const status = umusic.userMusicDifficultyStatuses[idx];
    const isAllPerfect = status.userMusicResults.reduce(
      (sum, elem) => sum || elem.playResult === "full_perfect",
      false
    );

    return sum + Number(isAllPerfect);
  }, 0);
};

const getMVPCount = (userMusics?: UserMusic[]) => {
  if (!userMusics) return 0;
  return userMusics.reduce((sum, umusic) => {
    umusic.userMusicDifficultyStatuses.forEach((status) => {
      status.userMusicResults.forEach((result) => {
        sum += result.mvpCount;
      });
    });
    return sum;
  }, 0);
};

const getSuperStarCount = (userMusics?: UserMusic[]) => {
  if (!userMusics) return 0;
  return userMusics.reduce((sum, umusic) => {
    umusic.userMusicDifficultyStatuses.forEach((status) => {
      status.userMusicResults.forEach((result) => {
        sum += result.superStarCount;
      });
    });
    return sum;
  }, 0);
};

const MusicSingleData: React.FC<{ umusic?: UserMusic; music: IMusicInfo }> =
  observer(({ umusic, music }) => {
    const { t } = useTranslation();
    const { getTranslated } = useAssetI18n();

    return umusic ? (
      <Fragment>
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Grid item xs={8} md={3}>
              <ProfileMusicImage
                assetbundleName={music.assetbundleName}
                title={getTranslated(
                  `music_titles:${umusic.musicId}`,
                  music.title
                )}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("music:difficulty")}</TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyEasy}
                          alt="difficulty easy"
                          bgColor=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyNormal}
                          alt="difficulty normal"
                          bgColor=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyHard}
                          alt="difficulty hard"
                          bgColor=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyExpert}
                          alt="difficulty expert"
                          bgColor=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyMaster}
                          alt="difficulty master"
                          bgColor=""
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{t("music:clear_status")}</TableCell>
                      {umusic.userMusicDifficultyStatuses.map((status) => (
                        <TableCell key={status.musicDifficulty} align="center">
                          <div style={{ minWidth: "64px" }}>
                            <img
                              src={getMusicClearIcon(status)}
                              alt="clear icon"
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>{t("music:hi_score")}</TableCell>
                      {umusic.userMusicDifficultyStatuses.map((status) => (
                        <TableCell key={status.musicDifficulty} align="center">
                          {status.userMusicResults.length &&
                          status.userMusicResults.find(
                            (umr) => umr.playType === "multi"
                          )
                            ? status.userMusicResults.find(
                                (umr) => umr.playType === "multi"
                              )!.highScore
                            : "N/A"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>{t("music:mvp_count")}</TableCell>
                      {umusic.userMusicDifficultyStatuses.map((status) => (
                        <TableCell key={status.musicDifficulty} align="center">
                          {status.userMusicResults.length &&
                          status.userMusicResults.find(
                            (umr) => umr.playType === "multi"
                          )
                            ? status.userMusicResults.find(
                                (umr) => umr.playType === "multi"
                              )!.mvpCount
                            : "N/A"}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>{t("music:super_star_count")}</TableCell>
                      {umusic.userMusicDifficultyStatuses.map((status) => (
                        <TableCell key={status.musicDifficulty} align="center">
                          {status.userMusicResults.length &&
                          status.userMusicResults.find(
                            (umr) => umr.playType === "multi"
                          )
                            ? status.userMusicResults.find(
                                (umr) => umr.playType === "multi"
                              )!.superStarCount
                            : "N/A"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    ) : (
      <Fragment>
        <Grid item xs={12}>
          <Typography>
            {t("user:profile.label.sekai_user_music_not_found")}
          </Typography>
        </Grid>
      </Fragment>
    );
  });

const SekaiUserStatistics = observer(() => {
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { getTranslated } = useAssetI18n();
  const {
    sekai: { sekaiProfileMap },
    region,
  } = useRootStore();

  const [areas] = useCachedData<IArea>("areas");
  const [areaItems] = useCachedData<IAreaItem>("areaItems");
  const [musics] = useCachedData<IMusicInfo>("musics");

  const [characterRankOpen, toggleCharacterRankOpen] = useToggle(false);
  const [challengeLiveOpen, toggleChallengeLiveOpen] = useToggle(false);
  const [honorOpen, toggleHonorOpen] = useToggle(false);
  const [areaItemOpen, toggleAreaItemOpen] = useToggle(false);
  const [musicOpen, toggleMusicOpen] = useToggle(false);
  const [selectedMusic, setSelectedMusic] = useState(1);

  const [sekaiProfile, setLocalSekaiProfile] = useState<ISekaiProfile>();

  useEffect(() => {
    autorun(() => {
      setLocalSekaiProfile(sekaiProfileMap.get(region));
    });
  }, []);

  const challengeLiveRanks = useMemo(
    () =>
      sekaiProfile?.sekaiUserProfile?.userChallengeLiveSoloStages.reduce(
        (res, curr) => {
          if (res[curr.characterId] && curr.rank > res[curr.characterId]) {
            res[curr.characterId] = curr.rank;
          } else {
            res[curr.characterId] = curr.rank;
          }
          return res;
        },
        {} as { [key: number]: number }
      ),
    [sekaiProfile]
  );

  return !!sekaiProfile && !!sekaiProfile.sekaiUserProfile ? (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Accordion
          expanded={characterRankOpen}
          onChange={() => toggleCharacterRankOpen()}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={layoutClasses.header}>
              {t("mission:type.character_rank")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {sekaiProfile.sekaiUserProfile?.userCharacters.map((chara) => (
                <Grid key={chara.characterId} item xs={3} md={2} lg={1}>
                  <Chip
                    avatar={
                      <Avatar
                        src={charaIcons[`CharaIcon${chara.characterId}`]}
                      />
                    }
                    label={chara.characterRank}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={challengeLiveOpen}
          onChange={() => toggleChallengeLiveOpen()}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={layoutClasses.header}>
              {t("common:challengeLive")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {sekaiProfile.sekaiUserProfile?.userCharacters.map((chara) => (
                <Grid key={chara.characterId} item xs={3} md={2} lg={1}>
                  <Chip
                    avatar={
                      <Avatar
                        src={charaIcons[`CharaIcon${chara.characterId}`]}
                      />
                    }
                    label={
                      (!!challengeLiveRanks &&
                        challengeLiveRanks[chara.characterId]) ||
                      0
                    }
                  />
                </Grid>
              ))}
            </Grid>
            <br />
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                <Typography>{t("music:hi_score")}</Typography>
              </Grid>
              {sekaiProfile.sekaiUserProfile.userChallengeLiveSoloResults[0] ? (
                <Fragment>
                  <Grid item>
                    <Avatar
                      src={
                        charaIcons[
                          `CharaIcon${sekaiProfile.sekaiUserProfile.userChallengeLiveSoloResults[0].characterId}`
                        ]
                      }
                    />
                  </Grid>
                  <Grid item>
                    {
                      sekaiProfile.sekaiUserProfile
                        .userChallengeLiveSoloResults[0].highScore
                    }
                  </Grid>
                </Fragment>
              ) : (
                <Grid item>
                  <Typography>N/A</Typography>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={honorOpen}
          onChange={() => toggleHonorOpen()}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={layoutClasses.header}>
              {t("common:mission.honor")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {sekaiProfile.sekaiUserProfile.userHonors.map((honor) => (
                <Grid key={honor.honorId} item xs={12} sm={6} md={3}>
                  <Tooltip title={new Date(honor.obtainedAt).toLocaleString()}>
                    <div>
                      <DegreeImage
                        honorId={honor.honorId}
                        honorLevel={honor.level}
                      />
                    </div>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={areaItemOpen}
          onChange={() => toggleAreaItemOpen()}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={layoutClasses.header}>
              {t("common:area_item")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {!!areaItems && !!areas && (
              <Grid container spacing={2}>
                {areas
                  .filter((area) => area.areaType === "spirit_world")
                  .concat([
                    {
                      id: 2,
                      assetbundleName: "area11",
                      areaType: "reality_world",
                      viewType: "side_view",
                      name: "神山高校",
                      releaseConditionId: 1,
                    },
                    {
                      id: 6,
                      assetbundleName: "area13",
                      areaType: "reality_world",
                      viewType: "side_view",
                      name: "宮益坂女子学園",
                      releaseConditionId: 1,
                    },
                  ])
                  .map((area) => (
                    <Grid key={area.id} item xs={12}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={4} md={2}>
                          <Tooltip title={area.name}>
                            <Image
                              src={`${
                                window.isChinaMainland
                                  ? `${import.meta.env.VITE_ASSET_DOMAIN_CN}`
                                  : `${
                                      import.meta.env.VITE_ASSET_DOMAIN_MINIO
                                    }/sekai-assets`
                              }/worldmap/contents/normal_rip/${
                                area.areaType === "reality_world"
                                  ? `worldmap_area${String(area.id).padStart(
                                      2,
                                      "0"
                                    )}`
                                  : `img_worldmap_areas${String(
                                      area.id
                                    ).padStart(2, "0")}`
                              }.png`}
                              alt={`area ${area.id}`}
                              style={{ height: "64px", width: "64px" }}
                              bgColor=""
                              showLoading
                            />
                          </Tooltip>
                        </Grid>
                        <Grid item xs={8} md={10}>
                          <Grid container>
                            {areaItems
                              .filter((ai) =>
                                area.id === 2
                                  ? ai.areaId === 11
                                  : area.id === 6
                                  ? ai.areaId === 13
                                  : ai.areaId === area.id
                              )
                              .map((areaItem) => (
                                <Grid
                                  item
                                  key={areaItem.id}
                                  xs={4}
                                  md={2}
                                  lg={1}
                                >
                                  <Tooltip title={areaItem.name}>
                                    <Grid container>
                                      <Grid item xs={12}>
                                        <Image
                                          src={`${
                                            window.isChinaMainland
                                              ? `${
                                                  import.meta.env
                                                    .VITE_ASSET_DOMAIN_CN
                                                }`
                                              : `${
                                                  import.meta.env
                                                    .VITE_ASSET_DOMAIN_MINIO
                                                }/sekai-assets`
                                          }/thumbnail/areaitem_rip/${
                                            areaItem.assetbundleName
                                          }.png`}
                                          alt={`area item ${areaItem.id}`}
                                          style={{
                                            height: "64px",
                                            width: "64px",
                                          }}
                                          bgColor=""
                                          showLoading
                                        />
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography align="center">
                                          {!!sekaiProfile.sekaiUserProfile &&
                                            sekaiProfile.sekaiUserProfile!.userAreaItems.find(
                                              (uai) =>
                                                uai.areaItemId === areaItem.id
                                            )?.level}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Tooltip>
                                </Grid>
                              ))}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider style={{ marginTop: "1em" }} />
                      </Grid>
                    </Grid>
                  ))}
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={musicOpen}
          onChange={() => toggleMusicOpen()}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={layoutClasses.header}>
              {t("common:music")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {musics && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Chip label={t("music:mvp_count")}></Chip>
                      {getMVPCount(sekaiProfile.sekaiUserProfile.userMusics)}
                    </Grid>
                    <Grid item>
                      <Chip label={t("music:super_star_count")}></Chip>
                      {getSuperStarCount(
                        sekaiProfile.sekaiUserProfile.userMusics
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("music:difficulty")}</TableCell>
                          <TableCell>
                            <Image
                              src={BtnDifficultyEasy}
                              alt="difficulty easy"
                              bgColor=""
                            />
                          </TableCell>
                          <TableCell>
                            <Image
                              src={BtnDifficultyNormal}
                              alt="difficulty normal"
                              bgColor=""
                            />
                          </TableCell>
                          <TableCell>
                            <Image
                              src={BtnDifficultyHard}
                              alt="difficulty hard"
                              bgColor=""
                            />
                          </TableCell>
                          <TableCell>
                            <Image
                              src={BtnDifficultyExpert}
                              alt="difficulty expert"
                              bgColor=""
                            />
                          </TableCell>
                          <TableCell>
                            <Image
                              src={BtnDifficultyMaster}
                              alt="difficulty master"
                              bgColor=""
                            />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            {t("user:profile.statistics.clear_count")}
                          </TableCell>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <TableCell key={idx} align="center">
                              <div style={{ minWidth: "64px" }}>
                                {getClearCount(
                                  idx,
                                  sekaiProfile.sekaiUserProfile!.userMusics
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            {t("user:profile.statistics.full_combo_count")}
                          </TableCell>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <TableCell key={idx} align="center">
                              <div style={{ minWidth: "64px" }}>
                                {getFullComboCount(
                                  idx,
                                  sekaiProfile.sekaiUserProfile!.userMusics
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            {t("user:profile.statistics.all_perfect_count")}
                          </TableCell>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <TableCell key={idx} align="center">
                              <div style={{ minWidth: "64px" }}>
                                {getAllPerfectCount(
                                  idx,
                                  sekaiProfile.sekaiUserProfile!.userMusics
                                )}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <FormControl>
                    <Select
                      labelId="sekai-profile-music-select-label"
                      id="sekai-profile-music-select"
                      value={selectedMusic}
                      onChange={(e) =>
                        setSelectedMusic(e.target.value as number)
                      }
                    >
                      {musics.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {getTranslated(`music_titles:${m.id}`, m.title)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <MusicSingleData
                  umusic={sekaiProfile.sekaiUserProfile.userMusics.find(
                    (um) => um.musicId === selectedMusic
                  )}
                  music={musics.find((m) => m.id === selectedMusic)!}
                />
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  ) : null;
});

export default SekaiUserStatistics;
