import { Theme } from "@material-ui/core";

export default function (theme: Theme): {
    header: any,
    content: any,
} {
  return {
    header: {
        fontWeight: "bold",
    },
    content: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        marginLeft: "auto",
        marginRight: "auto",
    },
  };
};
