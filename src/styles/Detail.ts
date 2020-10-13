import { makeStyles } from "@material-ui/core";

const useDetailStyles = makeStyles((theme) => ({
  header: {
    fontWeight: "bold",
  },
  content: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export { useDetailStyles };
