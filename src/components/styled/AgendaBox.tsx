import { Box, styled } from "@mui/material";

export default styled(Box)(({ theme }) => ({
  display: "block",
  [theme.breakpoints.down("md")]: {
    maxWidth: "100%",
  },
  maxWidth: "80%",
  margin: "auto",
  cursor: "pointer",
}));
