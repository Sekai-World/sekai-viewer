import {
  Collapse,
  Grid,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import React, { Fragment, useEffect, useState } from "react";
import { useLayoutStyles } from "../../styles/layout";
import {
  EventRankingResponse,
  EventRankingRewardRange,
  UserRanking,
} from "../../types";
import { CardThumb } from "../subs/CardThumb";
import CheerfulCarnivalTeamIcon from "../subs/CheerfulCarnivalTeamIcon";
import DegreeImage from "../subs/DegreeImage";
import EventTrackerGraph from "./EventTrackerGraph";

const useRowStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
  updated: {
    backgroundColor: theme.palette.warning.main,
    WebkitTransition: "background-color 850ms linear",
    msTransition: "background-color 850ms linear",
    transition: "background-color 850ms linear",
  },
}));

export const HistoryRow: React.FC<{
  rankingReward?: EventRankingRewardRange;
  rankingData: UserRanking;
  eventDuration: number;
  eventId: number;
}> = ({ rankingReward, rankingData, eventDuration, eventId }) => {
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow
        key={rankingData.userId}
        className={classes.root}
        onClick={() => setOpen(!open)}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          {rankingReward ? (
            <DegreeImage
              style={{
                maxHeight: "40px",
                minWidth: "120px",
                maxWidth: "220px",
              }}
              resourceBoxId={rankingReward.eventRankingRewards[0].resourceBoxId}
              type="event_ranking_reward"
            />
          ) : (
            <Typography>{`# ${rankingData.rank}`}</Typography>
          )}
        </TableCell>
        <TableCell>
          <Grid container alignItems="center">
            {rankingData.userCheerfulCarnival &&
              rankingData.userCheerfulCarnival.eventId && (
                <Grid item md={6} lg={4} xl={3}>
                  <CheerfulCarnivalTeamIcon
                    eventId={rankingData.userCheerfulCarnival.eventId}
                    teamId={
                      rankingData.userCheerfulCarnival.cheerfulCarnivalTeamId
                    }
                  />
                </Grid>
              )}
            <Grid item>
              <Typography style={{ minWidth: "100px" }}>
                {rankingData.name}
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell>
          <Typography align="right" style={{ minWidth: "80px" }}>
            {rankingData.score}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography align="right" style={{ minWidth: "80px" }}>
            {Math.round(rankingData.score / (eventDuration / 1000 / 3600))}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={2} md={1}>
                <CardThumb
                  cardId={rankingData.userCard.cardId}
                  trained={
                    rankingData.userCard.defaultImage === "special_training"
                  }
                />
              </Grid>
              <Grid item xs={9} sm={10} md={11}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      className={layoutClasses.bold}
                    >
                      {rankingData.name}
                    </Typography>
                    <Typography variant="subtitle2">
                      {rankingData.userProfile.word}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} container spacing={1}>
                    {rankingData.userProfile.honorId1 && (
                      <Grid item xs={4} md={3} lg={2}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId1}
                          honorLevel={rankingData.userProfile.honorLevel1}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId2 && (
                      <Grid item xs={4} md={3} lg={2}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId2}
                          honorLevel={rankingData.userProfile.honorLevel2}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId3 && (
                      <Grid item xs={4} md={3} lg={2}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId3}
                          honorLevel={rankingData.userProfile.honorLevel3}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <EventTrackerGraph
                    ranking={rankingData.rank as 1}
                    eventId={eventId}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export const LiveRow: React.FC<{
  rankingReward?: EventRankingRewardRange;
  rankingData: EventRankingResponse;
  eventDuration: number;
  rankingPred?: number;
  noPred?: boolean;
}> = ({
  rankingReward,
  rankingData,
  eventDuration,
  rankingPred,
  noPred = false,
}) => {
  // const { t } = useTranslation();
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);
  // const [isShowGraph, toggleIsShowGraph] = useToggle(false);
  const [customClass, setCustomClass] = useState("");
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    if (!lastScore && rankingData.score) {
      setLastScore(rankingData.score);
      setCustomClass(classes.root);
    } else if (lastScore && lastScore !== rankingData.score) {
      setLastScore(rankingData.score);
      setCustomClass(`${classes.root} ${classes.updated}`);
      setTimeout(() => setCustomClass(classes.root), 850);
    }
  }, [classes.root, classes.updated, lastScore, rankingData.score]);

  return (
    <Fragment>
      <TableRow
        key={rankingData.userId}
        className={customClass}
        onClick={() => setOpen(!open)}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          {rankingReward ? (
            <DegreeImage
              style={{
                maxHeight: "40px",
                minWidth: "120px",
                maxWidth: "220px",
              }}
              resourceBoxId={rankingReward.eventRankingRewards[0].resourceBoxId}
              type="event_ranking_reward"
            />
          ) : (
            <Typography>{`# ${rankingData.rank}`}</Typography>
          )}
        </TableCell>
        <TableCell>
          <Grid container alignItems="center" spacing={1}>
            {rankingData.userCheerfulCarnival &&
              rankingData.userCheerfulCarnival.eventId && (
                <Grid item md={6} lg={4} xl={3}>
                  <CheerfulCarnivalTeamIcon
                    eventId={rankingData.eventId}
                    teamId={
                      rankingData.userCheerfulCarnival.cheerfulCarnivalTeamId
                    }
                  />
                </Grid>
              )}
            <Grid item md={6} lg={8} xl={9}>
              <Typography style={{ minWidth: "100px" }}>
                {rankingData.userName}
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell>
          <Typography align="right" style={{ minWidth: "80px" }}>
            {rankingData.score}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography align="right" style={{ minWidth: "80px" }}>
            {Math.round(rankingData.score / (eventDuration / 1000 / 3600))}
          </Typography>
        </TableCell>
        {!noPred && (
          <TableCell>
            <Typography align="right">{rankingPred || "N/A"}</Typography>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container alignItems="center" spacing={2}>
              {rankingData.userCard && (
                <Grid item xs={2} md={1}>
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
              <Grid item xs={9} sm={10} md={11}>
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
                        <Grid item xs={4} md={3} lg={2}>
                          <DegreeImage
                            honorId={rankingData.userProfile.honorId1}
                            honorLevel={rankingData.userProfile.honorLevel1}
                          />
                        </Grid>
                      )}
                      {rankingData.userProfile.honorId2 && (
                        <Grid item xs={4} md={3} lg={2}>
                          <DegreeImage
                            honorId={rankingData.userProfile.honorId2}
                            honorLevel={rankingData.userProfile.honorLevel2}
                          />
                        </Grid>
                      )}
                      {rankingData.userProfile.honorId3 && (
                        <Grid item xs={4} md={3} lg={2}>
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
            <Grid container>
              <Grid item xs={12}>
                <EventTrackerGraph
                  rtRanking={rankingData}
                  ranking={rankingData.rank as 1}
                  eventId={rankingData.eventId}
                />
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
