import {
  Dialog,
  DialogContent,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  IBondsReward,
  IBond,
  IBondsHonor,
  IBondsHonorWord,
  IReleaseCondition,
} from "../../types";
import { useCachedData } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import DegreeImage from "../../components/widgets/DegreeImage";
import type { BondsHonorData } from "./BondsHonorGridView";
import ResourceBox from "../../components/widgets/ResourceBox";
import CutInVoicePlayer from "../../components/widgets/CutInVoicePlayer";
import BondsDegreeWord from "../../components/widgets/BondsDegreeWord";
import LevelNumberInput from "../../components/widgets/LevelNumberInput";

const BondsHonorDetailDialog: React.FC<{
  open: boolean;
  onClose: (event: object, reason: "backdropClick" | "escapeKeyDown") => void;
  data?: BondsHonorData;
}> = ({ open, onClose, data }) => {
  const { t } = useTranslation();

  const [bondsGroups] = useCachedData<IBond>("bonds");
  const [bondsRewards] = useCachedData<IBondsReward>("bondsRewards");
  const [bondsHonorWords] = useCachedData<IBondsHonorWord>("bondsHonorWords");
  const [releaseConditions] =
    useCachedData<IReleaseCondition>("releaseConditions");

  const [bondsGroup, setBondsGroup] = useState<IBond>();
  const [bondsWords, setBondsWords] = useState<IBondsHonorWord[]>([]);
  const [levels, setLevels] = useState<IBondsHonor["levels"]>([]);
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState<IBondsHonor["levels"][number]>();
  const [rank, setRank] = useState(1);
  const [rewards, setRewards] = useState<IBondsReward[]>([]);
  const [reward, setReward] = useState<IBondsReward>();

  useEffect(() => {
    if (
      bondsGroups?.length &&
      bondsRewards?.length &&
      data?.bond &&
      data?.word
    ) {
      const bondsGroup = bondsGroups.find(
        (hg) => hg.groupId === data.bond.bondsGroupId
      )!;
      setBondsGroup(bondsGroup);
      setLevels([...data.bond.levels].sort((a, b) => a.level - b.level));

      const rewards = bondsRewards
        .filter((r) => r.bondsGroupId === data.bond.bondsGroupId)
        .sort((a, b) => a.rank - b.rank);
      setRewards([...rewards]);
      setRank(data.bond.honorRarity === "low" ? rewards[0].rank : 30);
    }

    return () => {
      setBondsGroup(undefined);
      setLevels([]);
      setLevel(1);
      setLevelData(undefined);
      setRank(1);
      setRewards([]);
      setReward(undefined);
    };
  }, [data?.bond, data?.word, bondsGroups, bondsRewards]);

  useEffect(() => {
    if (data?.bond) {
      const levelData = levels.find((e) => e.level === level);
      setLevelData(levelData);
    }

    return () => {
      setLevelData(undefined);
    };
  }, [data?.bond, level, levels]);

  useEffect(() => {
    if (bondsRewards?.length && data?.bond) {
      const reward = bondsRewards.find(
        (r) => r.bondsGroupId === data.bond.bondsGroupId && r.rank === rank
      );
      setReward(reward);
    }

    return () => {
      setReward(undefined);
    };
  }, [bondsRewards, data?.bond, rank]);

  useEffect(() => {
    if (bondsHonorWords?.length && data?.bond) {
      const bondsWords = bondsHonorWords.filter(
        (bw) => bw.bondsGroupId === data.bond.bondsGroupId
      );
      setBondsWords(bondsWords);
    }

    return () => {
      setBondsWords([]);
    };
  }, [bondsHonorWords, data?.bond]);

  return bondsGroup && data?.bond && data.word ? (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item container justifyContent="center">
            <DegreeImage honorId={data.id} type="mission_reward" />
          </Grid>
        </Grid>
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("common:id")}
          </Typography>
          <Typography>{data.id}</Typography>
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("common:title")}
          </Typography>
          <ContentTrans
            contentKey={`honor_name:${data.bond.name}`}
            original={data.bond.name}
            originalProps={{
              align: "right",
            }}
            translatedProps={{
              align: "right",
            }}
          />
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("common:rarity")}
          </Typography>
          <Typography>{t(`honor:rarity.${data.bond.honorRarity}`)}</Typography>
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("member:availableWords")}
          </Typography>
          <Grid item container justifyContent="flex-end">
            {bondsWords?.map((bw) => (
              <Grid key={bw.id} item xs={10} md={8} lg={6} xl={4}>
                <BondsDegreeWord bondsHonorWordId={bw.id} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("common:level")}
          </Typography>
          <LevelNumberInput
            value={level}
            onChange={setLevel}
            min={levels[0].level}
            max={levels.slice(-1)[0].level}
          />
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("common:description")}
            </Typography>
          </Grid>
          <Grid item xs={8} md={9}>
            <Typography align="right">{levelData?.description}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("common:bondsRank")}
          </Typography>
          <LevelNumberInput
            value={rank}
            onChange={setRank}
            min={data.bond.honorRarity === "low" ? rewards[0].rank : 30}
            max={
              data.bond.honorRarity === "low" ? 29 : rewards.slice(-1)[0].rank
            }
          />
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("common:description")}
            </Typography>
          </Grid>
          <Grid item xs={8} md={9}>
            <Typography align="right">{reward?.description}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ margin: "1% 0" }} />
        <Grid
          container
          direction="row"
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("common:rewards")}
            </Typography>
          </Grid>
          <Grid item xs={8} md={9}>
            {reward?.bondsRewardType === "resource" && (
              <ResourceBox
                resourceBoxId={reward.resourceBoxId}
                resourceBoxPurpose="bonds_reward"
                justifyContent="flex-end"
                key={reward.id}
              />
            )}
            {reward?.bondsRewardType === "cut_in_voice" &&
              !!releaseConditions?.length && (
                <CutInVoicePlayer
                  releaseConditionId={
                    releaseConditions.find(
                      (rc) =>
                        rc.releaseConditionType === "bonds_rank" &&
                        rc.releaseConditionTypeId === reward.bondsGroupId &&
                        rc.releaseConditionTypeLevel === reward.rank
                    )?.id
                  }
                  key={reward.id}
                />
              )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  ) : null;
};

export default BondsHonorDetailDialog;
