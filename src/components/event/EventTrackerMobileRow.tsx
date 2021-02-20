import {
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@material-ui/core";
import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import { EventRankingResponse, UserRanking } from "../../types";
import { CardThumb } from "../subs/CardThumb";
import DegreeImage from "../subs/DegreeImage";
import EventTrackerGraph from "./EventTrackerGraph";

export const HistoryMobileRow: React.FC<{
  rankingData: UserRanking;
  eventId: number;
}> = ({ rankingData, eventId }) => {
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <Grid container onClick={() => setOpen(!open)} component={Paper}>
        <Grid item xs={2}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <Typography>{`# ${rankingData.rank}`}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography align="right">{rankingData.score} P</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={1}>
            {rankingData.userCard && (
              <Grid item xs={3}>
                <CardThumb
                  cardId={rankingData.userCard.cardId}
                  trained={
                    rankingData.userCard.defaultImage === "special_training"
                  }
                  level={rankingData.userCard.level}
                  masterRank={rankingData.userCard.masterRank}
                />
              </Grid>
            )}
            <Grid item xs={9}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    className={layoutClasses.bold}
                  >
                    {rankingData.name}
                  </Typography>
                  {rankingData.userProfile && (
                    <Typography variant="subtitle2">
                      {rankingData.userProfile.word}
                    </Typography>
                  )}
                </Grid>
                {rankingData.userProfile && (
                  <Grid item xs={12} container spacing={1}>
                    {rankingData.userProfile.honorId1 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId1}
                          honorLevel={rankingData.userProfile.honorLevel1}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId2 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId2}
                          honorLevel={rankingData.userProfile.honorLevel2}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId3 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId3}
                          honorLevel={rankingData.userProfile.honorLevel3}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <EventTrackerGraph
          ranking={rankingData.rank as 1}
          eventId={eventId}
          mobileTable={true}
        />
      </Collapse>
    </Fragment>
  );
};

export const LiveMobileRow: React.FC<{
  rankingData: EventRankingResponse;
  rankingPred?: number;
  noPred?: boolean;
}> = ({ rankingData, rankingPred, noPred = false }) => {
  const { t } = useTranslation();
  // const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);
  // const [isShowGraph, toggleIsShowGraph] = useToggle(false);

  return (
    <Fragment>
      <Grid container onClick={() => setOpen(!open)} component={Paper}>
        <Grid item xs={2}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <Typography>{`# ${rankingData.rank}`}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography align="right">{rankingData.score} P</Typography>
        </Grid>
        <Grid item xs={3}></Grid>
        {!noPred && (
          <Grid item xs={5}>
            <Typography>{t("event:rankingTable.head.prediction")}</Typography>
          </Grid>
        )}
        {!noPred && (
          <Grid item xs={4}>
            <Typography align="right">{rankingPred || "N/A"} P</Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={1}>
            {rankingData.userCard && (
              <Grid item xs={3}>
                <CardThumb
                  cardId={rankingData.userCard.cardId}
                  trained={
                    rankingData.userCard.defaultImage === "special_training"
                  }
                  level={rankingData.userCard.level}
                  masterRank={rankingData.userCard.masterRank}
                />
              </Grid>
            )}
            <Grid item xs={9}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    className={layoutClasses.bold}
                  >
                    {rankingData.userName}
                  </Typography>
                  {rankingData.userProfile && (
                    <Typography variant="subtitle2">
                      {rankingData.userProfile.word}
                    </Typography>
                  )}
                </Grid>
                {rankingData.userProfile && (
                  <Grid item xs={12} container spacing={1}>
                    {rankingData.userProfile.honorId1 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId1}
                          honorLevel={rankingData.userProfile.honorLevel1}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId2 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId2}
                          honorLevel={rankingData.userProfile.honorLevel2}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId3 && (
                      <Grid item xs={6}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId3}
                          honorLevel={rankingData.userProfile.honorLevel3}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <EventTrackerGraph
          rtRanking={rankingData}
          ranking={rankingData.rank as 1}
          eventId={rankingData.eventId}
          mobileTable={true}
        />
      </Collapse>
    </Fragment>
  );
};
