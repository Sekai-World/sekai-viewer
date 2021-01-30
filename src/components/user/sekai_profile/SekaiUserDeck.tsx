import { Grid } from "@material-ui/core";
import React from "react";
import { UserCard, UserDeck } from "../../../types";
import { CardThumbMedium } from "../../subs/CardThumb";

interface Props {
  userDecks: UserDeck[];
  userCards: UserCard[];
}

const SekaiUserDeck = (props: Props) => {
  return (
    <Grid container spacing={2} justify="center">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Grid item xs={4} md={2} key={`user-deck-${idx}`}>
          <CardThumbMedium
            cardId={props.userDecks[0][`member${idx + 1}` as "member1"]}
            trained={
              props.userCards.find(
                (card) =>
                  card.cardId ===
                  props.userDecks[0][`member${idx + 1}` as "member1"]
              )!.specialTrainingStatus === "done"
            }
            defaultImage={
              props.userCards.find(
                (card) =>
                  card.cardId ===
                  props.userDecks[0][`member${idx + 1}` as "member1"]
              )!.defaultImage
            }
            level={
              props.userCards.find(
                (card) =>
                  card.cardId ===
                  props.userDecks[0][`member${idx + 1}` as "member1"]
              )!.level
            }
            masterRank={
              props.userCards.find(
                (card) =>
                  card.cardId ===
                  props.userDecks[0][`member${idx + 1}` as "member1"]
              )!.masterRank
            }
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SekaiUserDeck;
