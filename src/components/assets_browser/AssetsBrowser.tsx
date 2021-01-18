import React from "react";
import { Link } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
//import Link from '@material-ui/core/Link';

import CdnSource from "../../utils/cdnSource";
import { withRouter } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
} from "@material-ui/core";
import { Folder } from "@material-ui/icons";
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

function renderBreadcrumb(assetPath: string, callback: any) {
  let splittedPath: string[] = assetPath.split("/");
  let temp: string = "";
  if (splittedPath[splittedPath.length - 1] === "") {
    let tempElement: string | undefined = splittedPath.pop();
    assetPath = assetPath.replace(tempElement + "/", "");
  }
  let out: any = splittedPath.map((entry) => {
    temp = temp + "/" + entry;
    let isLast = assetPath.endsWith(entry);
    return (
      <Link
        style={{
          textDecoration: "none",
          color: isLast ? "textPrimary" : "inherit",
        }}
        to={"/assetsBrowser" + temp + "/"}
        //onClick={() => callback(temp)}
        aria-current={isLast ? "page" : undefined}
      >
        {entry}
      </Link>
    );
  });
  return <Breadcrumbs aria-label="breadcrumb">{out}</Breadcrumbs>;
}

class AssetsBrowser extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    let path: string = props.history.location.pathname ?? "/assetsBrowser";
    path = path.replace("/assetsBrowser", "");
    if (path.startsWith("/")) path = path.substr(1);

    let isCompatible: boolean = cdns.getSelectedCdn()?.apiSchema !== null;

    this.state = {
      path: path,
      pathInformation: [],
      //
      loading: isCompatible ? true : false,
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
        return <>not implemented {cdns.getSelectedCdn()?.apiSchema}</>;
    }
  }
}

export default withRouter(AssetsBrowser);
