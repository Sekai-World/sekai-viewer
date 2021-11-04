import makeStyles from "@mui/styles/makeStyles";

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
  noDecorationAlsoOnHover: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "none",
    },
    color: "inherit",
  },
  noDecoration: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
    color: "inherit",
  },
  pointer: {
    cursor: "pointer",
  },
}));

export { useInteractiveStyles };
