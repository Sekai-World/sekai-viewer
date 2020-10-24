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

interface GridSizeOptions {
  /**
   * grid size for `xs` and wider (if not overridden) \
   * omit this property or set `undefined` to use default (12)
   */
  xs?: GridSize;
  /**
   * grid size for `sm` and wider (if not overridden) \
   * omit this property or set `undefined` to inherit from `xs` \
   */
  sm?: GridSize;
  /**
   * grid size for `md` and wider (if not overridden) \
   * omit this property or set `undefined` to inherit from `sm` \
   */
  md?: GridSize;
  /**
   * grid size for `lg` and wider (if not overridden) \
   * omit this property or set `undefined` to inherit from `md` \
   */
  lg?: GridSize;
  /**
   * grid size for `xl` and wider \
   * omit this property or set `undefined` to inherit from `lg` \
   */
  xl?: GridSize;
}

type CompleteGridSizeOptions = {
  [T in keyof Required<GridSizeOptions>]: Exclude<GridSize, undefined>;
};

interface IISProps<T> {
  viewComponent: React.FC<{ data?: T }>;
  callback: (
    entries: IntersectionObserverEntry[],
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  data: T[];
  gridSize?: GridSizeOptions;
}

const defaultXSGridSize: GridSize = 12;
const defaultGridSize: GridSizeOptions = {
  xs: defaultXSGridSize,
  md: 4,
};

function useBreakpoint(): keyof GridSizeOptions {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down("xs")) && "xs";
  const isSM = useMediaQuery(theme.breakpoints.only("sm")) && "sm";
  const isMD = useMediaQuery(theme.breakpoints.only("md")) && "md";
  const isLG = useMediaQuery(theme.breakpoints.only("lg")) && "lg";
  const isXL = useMediaQuery(theme.breakpoints.up("xl")) && "xl";
  return isXS || isSM || isMD || isLG || isXL || "xl";
}

function transformToCompleteGridSizeOptions(
  _gridSize?: GridSizeOptions | undefined
): CompleteGridSizeOptions {
  // use default if gridSize is not provided
  // not using defaults per properties because `{ md: 4 }` would not be desired
  const gridSize = {
    ...(_gridSize || defaultGridSize),
  };

  // inherit the value of the smaller breakpoint if not specified
  (["xs", "sm", "md", "lg", "xl"] as const).forEach((v, i, a) => {
    if (!gridSize[v]) {
      gridSize[v] = i > 0 ? gridSize[a[i - 1]] : defaultXSGridSize;
    }
  });

  return gridSize as CompleteGridSizeOptions;
}

function InfiniteScroll<T>({
  viewComponent,
  callback,
  data,
  gridSize: _gridSize,
}: React.PropsWithChildren<IISProps<T>>): React.ReactElement<IISProps<T>> {
  // this is necessary because of `viewGridSize`
  const gridSize = transformToCompleteGridSizeOptions(_gridSize);

  const breakpoint = useBreakpoint();

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

  const viewGridSize = gridSize[breakpoint];
  const itemsPerRow = 12 / viewGridSize;
  const numPlaceholders = data.length ? itemsPerRow : itemsPerRow * 2;

  return (
    <Fragment>
      <Grid container direction="row" spacing={1}>
        {data.length
          ? data.map((data, i) => (
              <Grid
                key={i}
                item
                xs={gridSize.xs}
                sm={gridSize.sm}
                md={gridSize.md}
                lg={gridSize.lg}
                xl={gridSize.xl}
              >
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
          <Grid
            key={`empty-${i}`}
            item
            xs={gridSize.xs}
            sm={gridSize.sm}
            md={gridSize.md}
            lg={gridSize.lg}
            xl={gridSize.xl}
          >
            {viewComponent({})}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}

export default InfiniteScroll;
