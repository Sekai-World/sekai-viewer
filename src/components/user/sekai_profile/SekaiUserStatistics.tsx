import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "material-ui-image";
import { SettingContext, UserContext } from "../../../context";
import { charaIcons } from "../../../utils/resources";
import DegreeImage from "../../subs/DegreeImage";
import { getRemoteAssetURL, useCachedData, useToggle } from "../../../utils";
import {
  IAreaItem,
  IMusicInfo,
  UserMusic,
  UserMusicDifficultyStatus,
} from "../../../types";
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

const ProfileMusicImage: React.FC<{
  assetbundleName: string;
  title: string;
}> = ({ assetbundleName, title }) => {
  const [img, setImg] = useState<string>("");

  useEffect(() => {
    if (!img)
      getRemoteAssetURL(
        `music/jacket/${assetbundleName}_rip/${assetbundleName}.webp`,
        setImg
      );
  }, [assetbundleName, img]);

  return <Image src={img} alt={title} aspectRatio={1} color=""></Image>;
};

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

const SekaiUserStatistics = () => {
  // const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();
  const { sekaiProfile } = useContext(UserContext)!;
  const { getTranslated } = useAssetI18n();
  const { contentTransMode } = useContext(SettingContext)!;

  const [areaItems] = useCachedData<IAreaItem>("areaItems");
  const [musics] = useCachedData<IMusicInfo>("musics");

  const [characterRankOpen, toggleCharacterRankOpen] = useToggle(false);
  const [honorOpen, toggleHonorOpen] = useToggle(false);
  const [areaItemOpen, toggleAreaItemOpen] = useToggle(false);
  const [musicOpen, toggleMusicOpen] = useToggle(false);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography>{t("mission:type.character_rank")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleCharacterRankOpen()}
        >
          {characterRankOpen ? t("common:hide") : t("common:show")}
        </Button>
        {characterRankOpen && (
          <Grid container spacing={1}>
            {sekaiProfile?.sekaiUserProfile?.userCharacters.map((chara) => (
              <Grid key={chara.characterId} item xs={3} md={2} lg={1}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Image
                      src={charaIcons[`CharaIcon${chara.characterId}`]}
                      alt={`cahra ${chara.characterId}`}
                      aspectRatio={1}
                      // style={{ height: "64px", width: "64px" }}
                      color=""
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography align="center">
                      {chara.characterRank}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:mission.honor")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleHonorOpen()}
        >
          {honorOpen ? t("common:hide") : t("common:show")}
        </Button>
        {honorOpen && (
          <Grid container spacing={1}>
            {sekaiProfile?.sekaiUserProfile?.userHonors.map((honor) => (
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
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:area_item")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleAreaItemOpen()}
        >
          {areaItemOpen ? t("common:hide") : t("common:show")}
        </Button>
        {areaItemOpen && !!areaItems && (
          <Grid container spacing={2}>
            {sekaiProfile?.sekaiUserProfile?.userAreaItems.map((areaItem) => (
              <Grid key={areaItem.areaItemId} item xs={4} md={2}>
                <Tooltip
                  title={
                    areaItems.find((ai) => ai.id === areaItem.areaItemId)!.name
                  }
                >
                  <Grid container>
                    <Grid item xs={12}>
                      <Image
                        src={`${
                          window.isChinaMainland
                            ? `${process.env.REACT_APP_ASSET_DOMAIN_CN}`
                            : `${process.env.REACT_APP_ASSET_DOMAIN_MINIO}/sekai-assets`
                        }/thumbnail/areaitem_rip/${
                          areaItems.find((ai) => ai.id === areaItem.areaItemId)!
                            .assetbundleName
                        }.png`}
                        alt={`area item ${areaItem.areaItemId}`}
                        aspectRatio={1}
                        // style={{ height: "64px", width: "64px" }}
                        color=""
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography align="center">{areaItem.level}</Typography>
                    </Grid>
                  </Grid>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography>{t("common:music")}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => toggleMusicOpen()}
        >
          {musicOpen ? t("common:hide") : t("common:show")}
        </Button>
        {musicOpen && musics && (
          <Grid container spacing={2}>
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
                          color=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyNormal}
                          alt="difficulty normal"
                          color=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyHard}
                          alt="difficulty hard"
                          color=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyExpert}
                          alt="difficulty expert"
                          color=""
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={BtnDifficultyMaster}
                          alt="difficulty master"
                          color=""
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
                              sekaiProfile?.sekaiUserProfile?.userMusics
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
                              sekaiProfile?.sekaiUserProfile?.userMusics
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
                              sekaiProfile?.sekaiUserProfile?.userMusics
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            {sekaiProfile?.sekaiUserProfile?.userMusics.map((umusic) => (
              <Grid key={umusic.musicId} item xs={12}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs={8} md={3}>
                    <ProfileMusicImage
                      assetbundleName={
                        musics.find((m) => m.id === umusic.musicId)!
                          .assetbundleName
                      }
                      title={getTranslated(
                        contentTransMode,
                        `music_titles:${umusic.musicId}`,
                        musics.find((m) => m.id === umusic.musicId)!.title
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
                                color=""
                              />
                            </TableCell>
                            <TableCell>
                              <Image
                                src={BtnDifficultyNormal}
                                alt="difficulty normal"
                                color=""
                              />
                            </TableCell>
                            <TableCell>
                              <Image
                                src={BtnDifficultyHard}
                                alt="difficulty hard"
                                color=""
                              />
                            </TableCell>
                            <TableCell>
                              <Image
                                src={BtnDifficultyExpert}
                                alt="difficulty expert"
                                color=""
                              />
                            </TableCell>
                            <TableCell>
                              <Image
                                src={BtnDifficultyMaster}
                                alt="difficulty master"
                                color=""
                              />
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{t("music:clear_status")}</TableCell>
                            {umusic.userMusicDifficultyStatuses.map(
                              (status) => (
                                <TableCell
                                  key={status.musicDifficulty}
                                  align="center"
                                >
                                  <div style={{ minWidth: "64px" }}>
                                    <img
                                      src={getMusicClearIcon(status)}
                                      alt="clear icon"
                                    />
                                  </div>
                                </TableCell>
                              )
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("music:hi_score")}</TableCell>
                            {umusic.userMusicDifficultyStatuses.map(
                              (status) => (
                                <TableCell
                                  key={status.musicDifficulty}
                                  align="center"
                                >
                                  {status.userMusicResults.length &&
                                  status.userMusicResults.find(
                                    (umr) => umr.playType === "multi"
                                  )
                                    ? status.userMusicResults.find(
                                        (umr) => umr.playType === "multi"
                                      )!.highScore
                                    : "N/A"}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("music:mvp_count")}</TableCell>
                            {umusic.userMusicDifficultyStatuses.map(
                              (status) => (
                                <TableCell
                                  key={status.musicDifficulty}
                                  align="center"
                                >
                                  {status.userMusicResults.length &&
                                  status.userMusicResults.find(
                                    (umr) => umr.playType === "multi"
                                  )
                                    ? status.userMusicResults.find(
                                        (umr) => umr.playType === "multi"
                                      )!.mvpCount
                                    : "N/A"}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("music:super_star_count")}</TableCell>
                            {umusic.userMusicDifficultyStatuses.map(
                              (status) => (
                                <TableCell
                                  key={status.musicDifficulty}
                                  align="center"
                                >
                                  {status.userMusicResults.length &&
                                  status.userMusicResults.find(
                                    (umr) => umr.playType === "multi"
                                  )
                                    ? status.userMusicResults.find(
                                        (umr) => umr.playType === "multi"
                                      )!.superStarCount
                                    : "N/A"}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default SekaiUserStatistics;
