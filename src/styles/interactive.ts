import { makeStyles } from "@material-ui/core";

const useInteractiveStyles = makeStyles((theme) => ({
  area: {
    margin: theme.spacing(1, 0),
  },
  caption: {
    [theme.breakpoints.up("md")]: {
      textAlign: "right",
    },
  },
}));

export { useInteractiveStyles };
