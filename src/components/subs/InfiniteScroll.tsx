import {
  // Box,
  Grid,
  // makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React, { Fragment, useEffect, useRef, useState } from "react";

// only divisor of 12
type GridSize = 1 | 2 | 3 | 4 | 6 | 12 | undefined;

interface IISProps<T> {
  viewComponent: React.FC<{ data?: T }>;
  callback: (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  data: T[];
  gridSize?: {
    xs?: GridSize;
    md?: GridSize;
  };
}

function InfiniteScroll<T>({
  viewComponent,
  callback,
  data,
  gridSize,
}: React.PropsWithChildren<IISProps<T>>): React.ReactElement<IISProps<T>> {
  const gridSizeXS = gridSize?.xs || 12;
  const gridSizeMD = gridSize?.md || 4;

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef(
    new IntersectionObserver((entries) => callback(entries, setHasMore), {
      threshold: 0.5,
    })
  );
  const listElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMore(true);
  }, [data]);

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

  const viewGridSize = isMD ? gridSizeMD : gridSizeXS;
  const itemsPerRow = 12 / viewGridSize;
  const numPlaceholders = data.length ? itemsPerRow : itemsPerRow * 2;

  return (
    <Fragment>
      <Grid container direction="row" spacing={1}>
        {data.length
          ? data.map((data, i) => (
              <Grid item xs={gridSizeXS} md={gridSizeMD} key={i}>
                {viewComponent({ data })}
              </Grid>
            ))
          : null}
      </Grid>
      <Grid
        container
        direction="row"
        ref={listElementRef}
        style={{ display: hasMore ? "flex" : "none", paddingTop: "4px" }}
        spacing={1}
      >
        {Array.from({
          length: numPlaceholders,
        }).map((_, i) => (
          <Grid item xs={gridSizeXS} md={gridSizeMD} key={`empty-${i}`}>
            {viewComponent({})}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}

export default InfiniteScroll;
