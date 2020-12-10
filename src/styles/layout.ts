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
}));

export { useLayoutStyles };
