import React, { ReactNode, useEffect, useState } from "react";
import Image from "material-ui-image";
import { getRemoteAssetURL } from "../../utils";

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

const ImageWrapper: React.FC<ImageProps & { directSrc?: boolean }> = ({
  src,
  directSrc = false,
  ...props
}) => {
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
        window.isChinaMainland
      );
    } else {
      setIsReady(true);
    }
  }, [directSrc, src]);
  return isReady ? <Image src={realSrc} {...props} /> : null;
};

export default ImageWrapper;
