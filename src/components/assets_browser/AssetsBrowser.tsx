import React from "react";
import { RouteComponentProps } from "react-router";

import CdnSource from "../../utils/cdnSource";
import { withRouter } from "react-router-dom";
import PjSekAiBrowser from "./PjSekAiBrowser";
import RayAssetsBrowser from "./RayAssetsBrowser";

const cdns = new CdnSource();

type PathParamsType = {
  path: any;
};

type IProps = RouteComponentProps<PathParamsType>;

interface PathInformation {
  path: string;
  type: string;
  filename: string;
}

interface IState {
  path: string;
  pathInformation: PathInformation[];
  loading: boolean;
  error: string | null;
}

class AssetsBrowser extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    let path: string = props.history.location.pathname ?? "/assetsBrowser";
    path = path.replace("/assetsBrowser", "");
    if (path.startsWith("/")) path = path.substr(1);

    let isCompatible: boolean = cdns.getSelectedCdn()?.apiSchema !== "";

    console.log(path, isCompatible);

    this.state = {
      path: path,
      pathInformation: [],
      loading: false,
      error: isCompatible ? null : "notCompatible",
    };
  }

  componentDidMount() {
    // TODO
  }

  componentDidUpdate() {
    let newPath: string =
      this.props.history.location.pathname ?? "/assetsBrowser";
    newPath = newPath.replace("/assetsBrowser", "").replaceAll("//", "/");
    if (newPath.startsWith("/")) newPath = newPath.substr(1);
    if (this.state.path !== newPath) {
      //this.retreivePathInformation(newPath);
      return true;
    }
    return false;
  }

  render() {
    console.log(this.state);

    if (this.state.loading) {
      return <>Loading...</>;
    }

    if (this.state.error) {
      return <>Error: {this.state.error}</>;
    }

    //this.props[path] = this.state.path;

    switch (cdns.getSelectedCdn()?.apiSchema) {
      case "pjsekai":
        return <PjSekAiBrowser {...this.props} />;
      case "ray":
        return <RayAssetsBrowser {...this.props} />;
      default:
        return <>not implemented "{cdns.getSelectedCdn()?.apiSchema}"</>;
    }
  }
}

export default withRouter(AssetsBrowser);
