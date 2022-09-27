import { styled, Typography } from "@mui/material";

export default styled(Typography)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    textAlign: "right",
  },
}));
