import { TabPanel } from "@mui/lab";
import { styled } from "@mui/material/styles";

export default styled(TabPanel)(({ theme }) => ({
  "& .MuiTabPanel-root": { padding: theme.spacing("1%", 0, 0, 0) },
}));
