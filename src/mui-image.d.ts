declare module "mui-image" {
  export interface ImageProps {
    src: string;
    alt?: string;
    bgColor?: string;
    className?: string;
    distance?: string | number;
    duration?: number;
    easing?: string;
    errorIcon?: boolean | React.ReactNode;
    fit?: string;
    height?: number | string;
    position?: string;
    shift?: boolean | string;
    shiftDuration?: number;
    showLoading?: boolean | React.ReactNode;
    style?: { [key: string]: string };
    width?: number | string;
    iconWrapperClass?: string;
    iconWrapperStyle?: { [key: string]: string };
    wrapperClass?: string;
    wrapperStyle?: { [key: string]: string };
  }
  class Image extends React.Component<ImageProps> {}
  export default Image;
}
