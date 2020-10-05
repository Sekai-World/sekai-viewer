import { makeStyles } from "@material-ui/core";
import React, { Fragment } from "react";
import { useCards } from "../../utils";

const useStyles = makeStyles((theme) => ({
  img: {
    [theme.breakpoints.down("md")]: {
      width: "20%",
      height: "20%",
    },
    [theme.breakpoints.up("lg")]: {
      width: "10%",
      height: "10%",
    },
  },
}));

const CardThumbs: React.FC<{ cardIds: number[] }> = ({ cardIds }) => {
  const classes = useStyles();
  const cards = useCards();
  return (
    <Fragment>
      {cardIds.map((cardId, id) => {
        const card = cards.find((card) => card.id === cardId);
        if (card) {
          return (
            <img
              className={classes.img}
              key={`card-${id}`}
              src={`https://sekai-res.dnaroma.eu/file/sekai-assets/thumbnail/chara_rip/${card.assetbundleName}_normal.webp`}
              alt={card.prefix}
            />
          );
        }
        return <div></div>;
      })}
    </Fragment>
  );
};

export default CardThumbs;
