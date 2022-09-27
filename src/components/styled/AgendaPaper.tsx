import { Paper, styled } from "@mui/material";

export default styled(Paper)(({ theme }) => ({
  [theme.breakpoints.down("md")]: { padding: "4% 4%" },
  [theme.breakpoints.up("md")]: { padding: "2% 2%" },
}));
