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
  sliderContainer: {
    [theme.breakpoints.up("md")]: {
      paddingRight: theme.spacing(5),
    },
  },
  inputHidden: {
    display: "none",
  },
  noDecoration: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
    color: theme.palette.text.primary,
  },
}));

export { useInteractiveStyles };
