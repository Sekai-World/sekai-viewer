import { Box, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import React, { Fragment, useEffect, useRef, useState } from "react";

const useStyles = makeStyles((theme) => ({
  boxflex: {
    [theme.breakpoints.down("sm")]: {
      flexBasis: "100%",
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: "33%",
    },
  },
}));

interface IISProps<T> {
  loadingComponent: React.FC<any>;
  viewComponent: React.FC<{ data: T }>;
  callback: (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  data: T[];
}

function InfiniteScroll<T>({
  loadingComponent,
  viewComponent,
  callback,
  data,
}: React.PropsWithChildren<IISProps<T>>): React.ReactElement<IISProps<T>> {
  const theme = useTheme();
  const classes = useStyles();
  const matchSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef(
    new IntersectionObserver((entries) => callback(entries, setHasMore), {
      threshold: 0.5,
    })
  );
  const listElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentObserver = observer.current;
    const currentElement = listElementRef.current;
    if (currentElement) currentObserver.observe(currentElement);

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  });

  return (
    <Fragment>
      <Box display="flex" flexDirection="row" flexWrap="wrap">
        {data.length
          ? data.map((elem, id) => (
              <Box className={classes.boxflex} key={id}>
                {viewComponent({ data: elem })}
              </Box>
            ))
          : Array.from({ length: matchSmallScreen ? 1 : 3 }, (_, i) => i).map(
              (_, id) => (
                <div className={classes.boxflex} key={10000 + id}>
                  {loadingComponent({})}
                </div>
              )
            )}
      </Box>
      <div
        style={{
          display: hasMore ? "flex" : "none",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
        ref={listElementRef}
      >
        {Array.from({ length: matchSmallScreen ? 1 : 3 }, (_, i) => i).map(
          (_, id) => (
            <div className={classes.boxflex} key={100000 + id}>
              {loadingComponent({})}
            </div>
          )
        )}
      </div>
    </Fragment>
  );
}

export default InfiniteScroll;
