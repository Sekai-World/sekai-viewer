import {
  Button,
  Collapse,
  Grid,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";
import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLayoutStyles } from "../../styles/layout";
import {
  EventRankingResponse,
  EventRankingRewardRange,
  UserRanking,
} from "../../types";
import { useToggle } from "../../utils";
import { CardThumb } from "../subs/CardThumb";
import DegreeImage from "../subs/DegreeImage";
import EventTrackerGraph from "./EventTrackerGraph";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

export const HistoryRow: React.FC<{
  rankingReward?: EventRankingRewardRange;
  rankingData: UserRanking;
  eventDuration: number;
  eventId: number;
}> = ({ rankingReward, rankingData, eventDuration, eventId }) => {
  const { t } = useTranslation();
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);
  const [isShowGraph, toggleIsShowGraph] = useToggle(false);

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
          <Typography style={{ minWidth: "100px" }}>
            {rankingData.name}
          </Typography>
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
          <Collapse in={open} timeout="auto">
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
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId2 && (
                      <Grid item xs={4} md={3} lg={2}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId2}
                        />
                      </Grid>
                    )}
                    {rankingData.userProfile.honorId3 && (
                      <Grid item xs={4} md={3} lg={2}>
                        <DegreeImage
                          honorId={rankingData.userProfile.honorId3}
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
                  {isShowGraph ? (
                    <EventTrackerGraph
                      ranking={rankingData.rank as 1}
                      eventId={eventId}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => toggleIsShowGraph()}
                    >
                      {t("event:tracker.button.graph")}
                    </Button>
                  )}
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
}> = ({ rankingReward, rankingData, eventDuration, rankingPred }) => {
  const { t } = useTranslation();
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  const [open, setOpen] = useState(false);
  const [isShowGraph, toggleIsShowGraph] = useToggle(false);

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
          <Typography style={{ minWidth: "100px" }}>
            {rankingData.userName}
          </Typography>
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
        <TableCell>
          <Typography align="right">{rankingPred || "N/A"}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Collapse in={open} timeout="auto">
            <Grid container alignItems="center" spacing={3}>
              {rankingData.userCard && (
                <Grid item xs={3} md={2}>
                  <CardThumb
                    cardId={rankingData.userCard.cardId}
                    trained={
                      rankingData.userCard.defaultImage === "special_training"
                    }
                  />
                </Grid>
              )}
              <Grid item xs={9} md={10}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" className={layoutClasses.bold}>
                      {rankingData.userName}
                    </Typography>
                    {rankingData.userProfile && (
                      <Typography>{rankingData.userProfile.word}</Typography>
                    )}
                  </Grid>
                  {rankingData.userProfile && (
                    <Grid item xs={12} container spacing={1}>
                      {rankingData.userProfile.honorId1 && (
                        <Grid item xs={6} md={4} lg={3}>
                          <DegreeImage
                            honorId={rankingData.userProfile.honorId1}
                          />
                        </Grid>
                      )}
                      {rankingData.userProfile.honorId2 && (
                        <Grid item xs={6} md={4} lg={3}>
                          <DegreeImage
                            honorId={rankingData.userProfile.honorId2}
                          />
                        </Grid>
                      )}
                      {rankingData.userProfile.honorId3 && (
                        <Grid item xs={6} md={4} lg={3}>
                          <DegreeImage
                            honorId={rankingData.userProfile.honorId3}
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
                {isShowGraph ? (
                  <EventTrackerGraph
                    rtRanking={rankingData}
                    ranking={rankingData.rank as 1}
                    eventId={rankingData.eventId}
                  />
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleIsShowGraph()}
                  >
                    {t("event:tracker.button.graph")}
                  </Button>
                )}
              </Grid>
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
