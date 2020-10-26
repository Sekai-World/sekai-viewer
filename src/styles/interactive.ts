import { makeStyles } from "@material-ui/core";

const useInteractiveStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1, 2),
  },
  caption: {
    [theme.breakpoints.up("md")]: {
      textAlign: "right",
    },
  },
}));

export { useInteractiveStyles };
