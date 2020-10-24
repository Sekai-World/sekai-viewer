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
const defaultMDGridSize: GridSize = 4;
const defaultGridSize: GridSizeOptions = {
  xs: defaultXSGridSize,
  md: defaultMDGridSize,
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

function InfiniteScroll<T>({
  viewComponent,
  callback,
  data,
  gridSize,
}: React.PropsWithChildren<IISProps<T>>): React.ReactElement<IISProps<T>> {
  gridSize = Object.assign({}, defaultGridSize, gridSize);

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

  const viewGridSize = gridSize[breakpoint]!;
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
                xs={gridSize!.xs}
                sm={gridSize!.sm}
                md={gridSize!.md}
                lg={gridSize!.lg}
                xl={gridSize!.xl}
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
            xs={gridSize!.xs}
            sm={gridSize!.sm}
            md={gridSize!.md}
            lg={gridSize!.lg}
            xl={gridSize!.xl}
          >
            {viewComponent({})}
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}

export default InfiniteScroll;
