import React, { useEffect, useState, useMemo } from "react";
import Image, { ImageProps } from "mui-image";
import { getRemoteAssetURL, useIntersectionObserver } from "../../utils";
import { ServerRegion } from "../../types.d";

const ImageWrapper: React.FC<
  ImageProps & { directSrc?: boolean; region?: ServerRegion; lazy?: boolean }
> = ({
  src,
  directSrc = false,
  lazy = false,
  region = "jp",
  duration = 1000,
  ...props
}) => {
  const [isReady, setIsReady] = useState(false);
  const [realSrc, setRealSrc] = useState(src);
  const [containerRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });
  const shouldLoad = !lazy || isVisible;

  useEffect(() => {
    if (!shouldLoad) return;

    if (!directSrc) {
      getRemoteAssetURL(
        src,
        (value: string) => {
          setRealSrc(value);
          setIsReady(true);
        },
        "minio",
        region
      );
    } else {
      setIsReady(true);
    }
  }, [directSrc, region, shouldLoad, src]);

  const imageProps = useMemo(
    () => Object.assign({}, props, { src: realSrc }),
    [props, realSrc]
  );

  const image = isReady ? <Image duration={duration} {...imageProps} /> : null;

  return lazy ? (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>{image}</div>
  ) : (
    image
  );
};

export default ImageWrapper;
