import { makeStyles } from "@material-ui/core";

const useFilterStyles = makeStyles((theme) => ({
  filterArea: {
    margin: theme.spacing(1, 0),
  },
  filterCaption: {
    [theme.breakpoints.up("md")]: {
      textAlign: "right",
    },
  },
}));

export { useFilterStyles };
