import { Typography, TypographyProps } from "@mui/material";
import React from "react";

const TypographyHeader = ({
  variant,
  fontWeight,
  ...props
}: TypographyProps) => {
  return (
    <Typography
      variant={variant || "h6"}
      fontWeight={fontWeight || "bold"}
      {...props}
    />
  );
};

export default TypographyHeader;
