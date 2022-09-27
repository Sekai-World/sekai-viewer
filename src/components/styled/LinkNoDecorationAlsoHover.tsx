import { Box } from "@mui/material";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

const LinkNoDecorationAlsoNoHover = (props: LinkProps) => {
  return (
    <Box
      sx={{
        textDecoration: "none",
        "&:hover": {
          textDecoration: "none",
        },
        color: "inherit",
      }}
      component={Link}
      {...props}
    />
  );
};

export default LinkNoDecorationAlsoNoHover;
