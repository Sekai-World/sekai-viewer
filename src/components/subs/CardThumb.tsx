import React, { Fragment } from "react";
import { useCards } from "../../utils";

const CardThumbs: React.FC<{ cardIds: number[] }> = ({ cardIds }) => {
  const cards = useCards();
  return (
    <Fragment>
      {
        cardIds.map((cardId, id) => {
          const card = cards.find((card) => card.id === cardId);
          if (card) {
            return (
              <img
                height="10%"
                width="10%"
                key={`card-${id}`}
                src={`https://sekai-res.dnaroma.eu/file/sekai-assets/thumbnail/chara_rip/${card.assetbundleName}_normal.webp`}
                alt={card.prefix}
              />
            );
          }
          return <div></div>;
        })
      }
    </Fragment>
  );
}

export default CardThumbs;
