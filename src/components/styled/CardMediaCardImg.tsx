import { Box, CardMedia, CardMediaProps } from "@mui/material";
import { styled } from "@mui/material/styles";

import React from "react";

type Props = CardMediaProps;

const CardMediaCardImg = (props: Props) => {
  const Root = styled(Box)`
    & .card-img-root {
      padding-top: 56.25%;
      cursor: pointer;
    }
  `;
  return (
    <Root>
      <CardMedia classes={{ root: "card-img-root" }} {...props} />
    </Root>
  );
};

export default CardMediaCardImg;
