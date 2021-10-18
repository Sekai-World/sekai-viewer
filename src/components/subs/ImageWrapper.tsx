import React, { ReactNode, useEffect, useState } from "react";
import Image from "material-ui-image";
import { getRemoteAssetURL } from "../../utils";
import { ServerRegion } from "../../types";

interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  animationDuration?: number;
  aspectRatio?: number;
  cover?: boolean;
  color?: string;
  disableError?: boolean;
  disableSpinner?: boolean;
  disableTransition?: boolean;
  errorIcon?: ReactNode;
  iconContainerStyle?: object;
  imageStyle?: object;
  loading?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onLoad?: (event?: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event?: React.SyntheticEvent<HTMLImageElement>) => void;
  src: string;
  style?: object;
}

const ImageWrapper: React.FC<
  ImageProps & { directSrc?: boolean; region?: ServerRegion }
> = ({ src, directSrc = false, region = "jp", ...props }) => {
  const [isReady, setIsReady] = useState(false);
  const [realSrc, setRealSrc] = useState(src);

  useEffect(() => {
    if (!directSrc) {
      getRemoteAssetURL(
        src,
        (value: string) => {
          setRealSrc(value);
          setIsReady(true);
        },
        window.isChinaMainland ? "cn" : "ww",
        region
      );
    } else {
      setIsReady(true);
    }
  }, [directSrc, region, src]);
  return isReady ? <Image src={realSrc} {...props} /> : null;
};

export default ImageWrapper;
