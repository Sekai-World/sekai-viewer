import { Box, CardMedia, CardMediaProps } from "@mui/material";
import { styled } from "@mui/material/styles";

import React from "react";

type Props = CardMediaProps;

const Root = styled(Box)`
  & .card-img-root {
    padding-top: 56.25%;
    cursor: pointer;
  }
`;

const CardMediaCardImg = (props: Props) => {
  return (
    <Root>
      <CardMedia classes={{ root: "card-img-root" }} {...props} />
    </Root>
  );
};

export default CardMediaCardImg;
