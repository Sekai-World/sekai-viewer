import makeStyles from "@mui/styles/makeStyles";

export const useSvgStyles = makeStyles(() => ({
  svg: {
    display: "block",
    width: "100%",
    height: "100%",
    pointerEvents: "visibleStroke",
  },
  skeleton: {
    width: "100%",
    paddingTop: "100%",
  },
}));
