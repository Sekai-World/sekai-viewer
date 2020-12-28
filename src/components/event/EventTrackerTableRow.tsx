import {
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
import { useLayoutStyles } from "../../styles/layout";
import {
  EventRankingResponse,
  EventRankingRewardRange,
  UserRanking,
} from "../../types";
import { CardThumb } from "../subs/CardThumb";
import DegreeImage from "../subs/DegreeImage";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

export const HistoryRow: React.FC<{
  rankingReward: EventRankingRewardRange;
  rankingData: UserRanking;
}> = ({ rankingReward, rankingData }) => {
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  return (
    <Fragment>
      <TableRow
        key={rankingReward.toRank}
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
          <DegreeImage
            style={{ maxHeight: "40px", minWidth: "120px", maxWidth: "220px" }}
            resourceBoxId={rankingReward.eventRankingRewards[0].resourceBoxId}
            type="event_ranking_reward"
          />
        </TableCell>
        <TableCell style={{ minWidth: "100px" }}>
          <Typography style={{ minWidth: "100px" }}>
            {rankingData.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography align="right">{rankingData.score}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={3} md={2}>
                <CardThumb
                  cardId={rankingData.userCard.cardId}
                  trained={
                    rankingData.userCard.defaultImage === "special_training"
                  }
                />
              </Grid>
              <Grid item xs={9} md={10}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" className={layoutClasses.bold}>
                      {rankingData.name}
                    </Typography>
                    <Typography>{rankingData.userProfile.word}</Typography>
                  </Grid>
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
  rankingReward: EventRankingRewardRange;
  rankingData: EventRankingResponse;
}> = ({ rankingReward, rankingData }) => {
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();
  const layoutClasses = useLayoutStyles();

  return (
    <Fragment>
      <TableRow
        key={rankingReward.toRank}
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
          <DegreeImage
            style={{ maxHeight: "40px", minWidth: "120px", maxWidth: "220px" }}
            resourceBoxId={rankingReward.eventRankingRewards[0].resourceBoxId}
            type="event_ranking_reward"
          />
        </TableCell>
        <TableCell style={{ minWidth: "100px" }}>
          <Typography style={{ minWidth: "100px" }}>
            {rankingData.userName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography align="right">{rankingData.score}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} style={{ paddingTop: 0, paddingBottom: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
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
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
