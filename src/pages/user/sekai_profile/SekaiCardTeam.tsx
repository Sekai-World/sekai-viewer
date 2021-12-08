import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRootStore } from "../../../stores/root";
import { ISekaiCardTeam, ISekaiProfile } from "../../../stores/sekai";
import { useLayoutStyles } from "../../../styles/layout";
import { useStrapi } from "../../../utils/apiClient";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";

const SekaiUserCardList = React.lazy(() => import("./SekaiUserCardList"));
const SekaiUserImportMember = React.lazy(
  () => import("./SekaiUserImportMember")
);
const SekaiUserTeams = React.lazy(() => import("./SekaiUserTeams"));

const SekaiCardTeam: React.FC<{}> = observer(() => {
  const layoutClasses = useLayoutStyles();
  const {
    sekai: { sekaiProfileMap, sekaiCardTeamMap, setSekaiCardTeam },
    jwtToken,
    region,
  } = useRootStore();
  const { t } = useTranslation();

  const { getSekaiCardTeamMe, postSekaiCardTeamMe } = useStrapi(jwtToken);

  const [isUserMemberOpen, setIsUserMemberOpen] = useState(false);
  const [isUserImportMemberOpen, setIsUserImportMemberOpen] = useState(false);
  const [isUserTeamsOpen, setIsUserTeamsOpen] = useState(false);
  const [isSyncingCardTeam, setIsSyncingCardTeam] = useState(false);
  const [isUpdatedCardTeam, setIsUpdatedCardTeam] = useState(false);
  const [sekaiProfile, setLocalSekaiProfile] = useState<ISekaiProfile>();
  const [sekaiCardTeam, setLocalSekaiCardTeam] = useState<ISekaiCardTeam>();

  useEffect(() => {
    autorun(() => {
      setLocalSekaiProfile(sekaiProfileMap.get(region));
      setLocalSekaiCardTeam(sekaiCardTeamMap.get(region));
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const check = async () => {
      if (!isCancelled) {
        try {
          const entry = await getSekaiCardTeamMe();
          setSekaiCardTeam(entry as ISekaiCardTeam, region);
          setIsUpdatedCardTeam(true);
        } catch (error) {
          if (!isCancelled && !sekaiCardTeam && sekaiProfile) {
            setIsSyncingCardTeam(true);
            const entry = await postSekaiCardTeamMe(
              sekaiProfile.cardList || [],
              sekaiProfile.deckList || []
            );
            setSekaiCardTeam(entry, region);
            setIsUpdatedCardTeam(true);
            setIsSyncingCardTeam(false);
          } else if (!isCancelled && !sekaiCardTeam) {
            setIsSyncingCardTeam(true);
            await postSekaiCardTeamMe([], []);
            setIsUpdatedCardTeam(true);
            setIsSyncingCardTeam(false);
          }
        }
      }
    };

    if (!isSyncingCardTeam && !isUpdatedCardTeam) {
      check();
    }

    return () => {
      isCancelled = true;
    };
  }, [
    getSekaiCardTeamMe,
    isSyncingCardTeam,
    isUpdatedCardTeam,
    postSekaiCardTeamMe,
    region,
    sekaiCardTeam,
    sekaiProfile,
    setSekaiCardTeam,
  ]);

  return isSyncingCardTeam ? (
    <Typography>{t("user:profile.syncing_card_team")}</Typography>
  ) : sekaiCardTeam ? (
    <Fragment>
      <Accordion
        expanded={isUserMemberOpen}
        onChange={(e, state) => setIsUserMemberOpen(state)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className={layoutClasses.header}>
            {t("user:profile.title.card_list")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SekaiUserCardList />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={isUserImportMemberOpen}
        onChange={(e, state) => setIsUserImportMemberOpen(state)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className={layoutClasses.header}>
            {t("user:profile.title.import_card")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SekaiUserImportMember />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={isUserTeamsOpen}
        onChange={(e, state) => setIsUserTeamsOpen(state)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className={layoutClasses.header}>
            {t("user:profile.title.manage_teams")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SekaiUserTeams />
        </AccordionDetails>
      </Accordion>
    </Fragment>
  ) : null;
});

export default SekaiCardTeam;
