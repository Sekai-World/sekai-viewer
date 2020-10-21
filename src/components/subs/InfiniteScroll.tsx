import {
  // Box,
  Grid,
  // makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React, { Fragment, useEffect, useRef, useState } from "react";

type GridSize =
  | boolean
  | "auto"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | undefined;

interface IISProps<T> {
  loadingComponent: React.FC<any>;
  viewComponent: React.FC<{ data: T }>;
  callback: (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  data: T[];
  gridSize?: {
    xs: GridSize;
    md: GridSize;
  };
}

function InfiniteScroll<T>({
  loadingComponent,
  viewComponent,
  callback,
  data,
  gridSize,
}: React.PropsWithChildren<IISProps<T>>): React.ReactElement<IISProps<T>> {
  const theme = useTheme();
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

  const itemsPerRow =
    matchSmallScreen
      ? 1
      : 12 / (gridSize ? Number(gridSize.md) : 4);

  return (
    <Fragment>
      <Grid container direction="row" spacing={1}>
        {data.length
          ? data.map((elem, id) => (
              <Grid
                item
                xs={gridSize ? gridSize.xs : 12}
                md={gridSize ? gridSize.md : 4}
                key={id}
              >
                {viewComponent({ data: elem })}
              </Grid>
          ))
          : null}
      </Grid>
      <Grid
        container
        direction="row"
        ref={listElementRef}
        style={{ display: hasMore ? "flex" : "none" }}
        spacing={1}
      >
        {Array.from(
          {
            length: data.length ? itemsPerRow : itemsPerRow * 2
          },
          (_, i) => i
        ).map((_, id) => (
          <Grid
            item
            xs={gridSize ? gridSize.xs : 12}
            md={gridSize ? gridSize.md : 4}
            key={`empty-${id}`}
          >
            {loadingComponent({})}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}

export default InfiniteScroll;
