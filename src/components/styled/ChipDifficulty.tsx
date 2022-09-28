import { Chip, ChipProps, styled } from "@mui/material";

import React from "react";

type Props = {
  difficulty: string;
  value: string;
} & ChipProps;

const ChipDifficultyStyled = styled(Chip)(() => ({
  "& .chip-bg-easy": {
    backgroundColor: "#86DA45",
  },
  "& .chip-bg-normal": {
    backgroundColor: "#5FB8E6",
  },
  "& .chip-bg-hard": {
    backgroundColor: "#F3AE3C",
  },
  "& .chip-bg-expert": {
    backgroundColor: "#DC5268",
  },
  "& .chip-bg-master": {
    backgroundColor: "#AC3EE6",
  },
}));

const ChipDifficulty = (props: Props) => {
  return (
    <ChipDifficultyStyled
      color={props.color || "primary"}
      size={props.size || "small"}
      classes={{
        colorPrimary: `chip-bg-${props.difficulty}`,
      }}
      label={props.value}
    />
  );
};

export default ChipDifficulty;
