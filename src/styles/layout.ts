import { makeStyles } from "@material-ui/core";

const useLayoutStyles = makeStyles((theme) => ({
  header: {
    fontWeight: "bold",
  },
  content: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: "auto",
    marginRight: "auto",
  },
  alert: {
    margin: theme.spacing(1, 0),
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  avatarProfile: {
    [theme.breakpoints.down("sm")]: {
      height: theme.spacing(10),
      width: theme.spacing(10),
    },
    [theme.breakpoints.up("md")]: {
      height: theme.spacing(20),
      width: theme.spacing(20),
    },
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
