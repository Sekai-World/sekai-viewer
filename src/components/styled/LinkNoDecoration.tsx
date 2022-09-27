import { Box } from "@mui/material";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

const LinkNoDecoration = (props: LinkProps) => {
  return (
    <Box
      sx={{
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
        },
        color: "inherit",
      }}
      component={Link}
      {...props}
    />
  );
};

export default LinkNoDecoration;
