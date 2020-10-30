import { makeStyles } from "@material-ui/core";

export const useSvgStyles = makeStyles(() => ({
  svg: {
    display: "block",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  skeleton: {
    width: "100%",
    paddingTop: "100%",
  },
}));
