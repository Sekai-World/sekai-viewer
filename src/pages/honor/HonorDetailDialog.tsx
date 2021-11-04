import {
  Dialog,
  DialogContent,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IHonorGroup, IHonorInfo } from "../../types.d";
import { useCachedData } from "../../utils";
import { ContentTrans } from "../../components/helpers/ContentTrans";
import DegreeImage from "../../components/widgets/DegreeImage";

const DetailDialog: React.FC<{
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  data?: IHonorInfo;
}> = ({ open, onClose, data }) => {
  const { t } = useTranslation();

  const [honors] = useCachedData<IHonorInfo>("honors");
  const [honorGroups] = useCachedData<IHonorGroup>("honorGroups");

  const [honorGroup, setHonorGroup] = useState<IHonorGroup>();

  useEffect(() => {
    if (honors && honors.length && honorGroups && honorGroups.length && data) {
      const honorGroup = honorGroups.find((hg) => hg.id === data.groupId)!;
      setHonorGroup(honorGroup);
    }
  }, [honors, honorGroups, data]);

  return honorGroup && data ? (
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
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            {t("common:id")}
          </Typography>
          <Typography>{data.id}</Typography>
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
            {t("common:title")}
          </Typography>
          <ContentTrans
            contentKey={`honor_name:${data.name}`}
            original={data.name}
            originalProps={{
              align: "right",
            }}
            translatedProps={{
              align: "right",
            }}
          />
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
            {t("honor:honor_group")}
          </Typography>
          <ContentTrans
            contentKey={`honorGroup_name:${honorGroup.id}`}
            original={honorGroup.name}
            originalProps={{
              align: "right",
            }}
            translatedProps={{
              align: "right",
            }}
          />
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
          <Typography>{t(`honor:rarity.${data.honorRarity}`)}</Typography>
        </Grid>
        <Divider style={{ margin: "1% 0" }} />
        {data.levels.map((level) => (
          <Fragment>
            <Grid
              container
              direction="row"
              wrap="nowrap"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t("common:level")}
              </Typography>
              <Typography>{level.level}</Typography>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
            <Grid
              container
              direction="row"
              wrap="nowrap"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid item xs={3} md={2}>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  {t("common:description")}
                </Typography>
              </Grid>
              <Grid item xs={8} md={9}>
                <Typography align="right">{level.description}</Typography>
              </Grid>
            </Grid>
            <Divider style={{ margin: "1% 0" }} />
          </Fragment>
        ))}
      </DialogContent>
    </Dialog>
  ) : null;
};

export default DetailDialog;
