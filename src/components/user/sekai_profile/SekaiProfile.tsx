import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Typography,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import React, { Fragment, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../context";
// import { useInteractiveStyles } from "../../../styles/interactive";
import { useLayoutStyles } from "../../../styles/layout";
import SekaiUserStatistics from "./SekaiUserStatistics";
const SekaiEventRecord = React.lazy(() => import("./SekaiEventRecord"));
const SekaiID = React.lazy(() => import("./SekaiID"));
const SekaiUserCardList = React.lazy(() => import("./SekaiUserCardList"));
const SekaiUserDeck = React.lazy(() => import("./SekaiUserDeck"));
const SekaiUserImportMember = React.lazy(
  () => import("./SekaiUserImportMember")
);
const SekaiUserTeams = React.lazy(() => import("./SekaiUserTeams"));

const SekaiProfile = () => {
  const layoutClasses = useLayoutStyles();
  // const interactiveClasses = useInteractiveStyles();
  const { t } = useTranslation();

  const { sekaiProfile } = useContext(UserContext)!;

  const [isUserDeckOpen, setIsUserDeckOpen] = useState(false);
  const [isUserEventOpen, setIsUserEventOpen] = useState(false);
  const [isUserStatisticsOpen, setIsUserStatisticsOpen] = useState(false);
  const [isUserMemberOpen, setIsUserMemberOpen] = useState(false);
  const [isUserImportMemberOpen, setIsUserImportMemberOpen] = useState(false);
  const [isUserTeamsOpen, setIsUserTeamsOpen] = useState(false);

  return (
    <Fragment>
      <Typography variant="h6" className={layoutClasses.header}>
        {t("user:profile.title.sekai_profile")}
      </Typography>
      <Container className={layoutClasses.content} maxWidth="md">
        <SekaiID />
        <br />
        {sekaiProfile && sekaiProfile.sekaiUserProfile && (
          <Fragment>
            <Accordion
              expanded={isUserEventOpen}
              onChange={(e, state) => setIsUserEventOpen(state)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography className={layoutClasses.header}>
                  {t("user:profile.title.user_event")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SekaiEventRecord />
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={isUserDeckOpen}
              onChange={(e, state) => setIsUserDeckOpen(state)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography className={layoutClasses.header}>
                  {t("user:profile.title.user_deck")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SekaiUserDeck
                  userDecks={sekaiProfile.sekaiUserProfile.userDecks}
                  userCards={sekaiProfile.sekaiUserProfile.userCards}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={isUserStatisticsOpen}
              onChange={(e, state) => setIsUserStatisticsOpen(state)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography className={layoutClasses.header}>
                  {t("user:profile.title.user_statistics")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <SekaiUserStatistics />
              </AccordionDetails>
            </Accordion>
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
        )}
      </Container>
    </Fragment>
  );
};

export default SekaiProfile;
