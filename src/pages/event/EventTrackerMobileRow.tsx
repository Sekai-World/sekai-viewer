import { Collapse, Grid, IconButton, Paper, Typography } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EventRankingResponse } from "../../types.d";
import { CardThumb } from "../../components/widgets/CardThumb";
import CheerfulCarnivalTeamIcon from "../../components/widgets/CheerfulCarnivalTeamIcon";
import DegreeImage from "../../components/widgets/DegreeImage";
import EventTrackerGraph from "./EventTrackerGraph";
import BondsDegreeImage from "../../components/widgets/BondsDegreeImage";

export const HistoryMobileRow: React.FC<{
  rankingData: EventRankingResponse;
  eventId: number;
}> = ({ rankingData, eventId }) => {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <Grid container onClick={() => setOpen(!open)} component={Paper}>
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={2} sm={1}>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Grid>
            {rankingData.userCheerfulCarnival &&
              rankingData.userCheerfulCarnival.eventId && (
                <Grid item xs={1}>
                  <CheerfulCarnivalTeamIcon
                    eventId={rankingData.userCheerfulCarnival.eventId}
                    teamId={
                      rankingData.userCheerfulCarnival.cheerfulCarnivalTeamId
                    }
                  />
                </Grid>
              )}
            <Grid item xs={3}>
              <Typography>{`# ${rankingData.rank}`}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography align="right">{rankingData.score} P</Typography>
            </Grid>
          </Grid>
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    {rankingData.userName}
                  </Typography>
                  {rankingData.userProfile && (
                    <Typography variant="subtitle2">
                      {rankingData.userProfile.word}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Grid container spacing={1}>
          {rankingData.userProfile && (
            <Fragment>
              {rankingData.userProfile.honorId1 && (
                <Grid item xs={4} sm={6}>
                  <DegreeImage
                    honorId={rankingData.userProfile.honorId1}
                    honorLevel={rankingData.userProfile.honorLevel1}
                  />
                </Grid>
              )}
              {rankingData.userProfile.honorId2 && (
                <Grid item xs={4} sm={6}>
                  <DegreeImage
                    honorId={rankingData.userProfile.honorId2}
                    honorLevel={rankingData.userProfile.honorLevel2}
                  />
                </Grid>
              )}
              {rankingData.userProfile.honorId3 && (
                <Grid item xs={4} sm={6}>
                  <DegreeImage
                    honorId={rankingData.userProfile.honorId3}
                    honorLevel={rankingData.userProfile.honorLevel3}
                  />
                </Grid>
              )}
            </Fragment>
          )}
        </Grid>
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

  const [open, setOpen] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [scoreUpdated, setScoreUpdated] = useState(false);

  useEffect(() => {
    if (!lastScore && rankingData.score) {
      setLastScore(rankingData.score);
      setScoreUpdated(false);
    } else if (lastScore && lastScore !== rankingData.score) {
      setLastScore(rankingData.score);
      setScoreUpdated(true);
      setTimeout(() => setScoreUpdated(false), 850);
    }
  }, [lastScore, rankingData.score]);

  return (
    <Fragment>
      <Grid
        container
        onClick={() => setOpen(!open)}
        component={Paper}
        sx={[
          { transition: "background-color 850ms linear" },
          scoreUpdated && { backgroundColor: "warning.main" },
        ]}
      >
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={2} sm={1}>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              </IconButton>
            </Grid>
            {rankingData.userCheerfulCarnival &&
              rankingData.userCheerfulCarnival.eventId && (
                <Grid item xs={1}>
                  <CheerfulCarnivalTeamIcon
                    eventId={rankingData.userCheerfulCarnival.eventId}
                    teamId={
                      rankingData.userCheerfulCarnival.cheerfulCarnivalTeamId
                    }
                  />
                </Grid>
              )}
            <Grid item xs={3}>
              <Typography>{`# ${rankingData.rank}`}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography align="right">{rankingData.score} P</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            {!noPred && (
              <Grid item xs={5}>
                <Typography>
                  {t("event:rankingTable.head.prediction")}
                </Typography>
              </Grid>
            )}
            {!noPred && (
              <Grid item xs={4}>
                <Typography align="right">{rankingPred || "N/A"} P</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" spacing={1}>
            {rankingData.userCard && (
              <Grid item xs={3}>
                {rankingData.userCheerfulCarnival &&
                  rankingData.userCheerfulCarnival.eventId && (
                    <CheerfulCarnivalTeamIcon
                      eventId={rankingData.eventId}
                      teamId={
                        rankingData.userCheerfulCarnival.cheerfulCarnivalTeamId
                      }
                    />
                  )}
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
                  <Typography variant="subtitle1" fontWeight="bold">
                    {rankingData.userName}
                  </Typography>
                  {rankingData.userProfile && (
                    <Typography variant="subtitle2">
                      {rankingData.userProfile.word}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {rankingData.userProfile && !rankingData.userProfileHonors && (
          <Grid container spacing={1}>
            {rankingData.userProfile.honorId1 && (
              <Grid item xs={6} sm={6}>
                <DegreeImage
                  honorId={rankingData.userProfile.honorId1}
                  honorLevel={rankingData.userProfile.honorLevel1}
                />
              </Grid>
            )}
            {rankingData.userProfile.honorId2 && (
              <Grid item xs={3} sm={6}>
                <DegreeImage
                  honorId={rankingData.userProfile.honorId2}
                  honorLevel={rankingData.userProfile.honorLevel2}
                  sub
                />
              </Grid>
            )}
            {rankingData.userProfile.honorId3 && (
              <Grid item xs={3} sm={6}>
                <DegreeImage
                  honorId={rankingData.userProfile.honorId3}
                  honorLevel={rankingData.userProfile.honorLevel3}
                  sub
                />
              </Grid>
            )}
          </Grid>
        )}
        {rankingData.userProfile && rankingData.userProfileHonors && (
          <Grid container spacing={1}>
            {rankingData.userProfileHonors.map((honor, idx) => (
              <Grid item xs={idx === 0 ? 6 : 3} sm={6} key={honor.honorId}>
                {honor.profileHonorType === "normal" ? (
                  <DegreeImage
                    honorId={honor.honorId}
                    honorLevel={honor.honorLevel}
                    sub={idx !== 0}
                  />
                ) : honor.profileHonorType === "bonds" ? (
                  <BondsDegreeImage
                    honorId={honor.honorId}
                    bondsHonorWordId={honor.bondsHonorWordId!}
                    type={honor.profileHonorType}
                    viewType={honor.bondsHonorViewType}
                    honorLevel={honor.honorLevel}
                    sub={idx !== 0}
                  />
                ) : null}
              </Grid>
            ))}
          </Grid>
        )}
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
