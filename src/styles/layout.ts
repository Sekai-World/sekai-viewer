import makeStyles from "@mui/styles/makeStyles";

const useLayoutStyles = makeStyles((theme) => ({
  header: {
    fontWeight: "bold",
  },
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    // marginLeft: "auto",
    // marginRight: "auto",
  },
  alert: {
    margin: theme.spacing(1, 0),
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  capitalize: {
    textTransform: "capitalize",
  },
  tabpanel: {
    padding: theme.spacing("1%", 0, 0, 0),
  },
  "grid-out": {
    padding: theme.spacing("1%", "0"),
  },
}));

export { useLayoutStyles };
