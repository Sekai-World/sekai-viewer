import React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import CdnSource from "../../utils/cdnSource";
import AssetModal from "./AssetModal";

const cdns = new CdnSource();

type PathParamsType = {
  path: string;
};

type IProps = RouteComponentProps<PathParamsType>;

interface AbstractPathInformation {
  path: string;
  filename: string;
}

interface IState {
  path: string;
  pathModal: string;
  pathInformation: AbstractPathInformation[];
  typeSelectedAsset: string;
  openModal: boolean;
  loading: boolean;
  error: string | null;
}

const homePath: string = "HOME";

function renderBreadcrumb(assetPath: string, callback: any) {
  let splittedPath: string[] = assetPath.split("/");
  let temp: string = "";
  if (splittedPath[splittedPath.length - 1] === "") {
    let tempElement: string | undefined = splittedPath.pop();
    assetPath = assetPath.replace(tempElement + "/", "");
  }
  splittedPath.unshift(homePath);
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {splittedPath.map((entry) => {
        let isHome = entry.indexOf(homePath) > -1;
        temp = isHome ? temp : temp + "/" + entry;
        console.log(temp);
        let isLast = assetPath.endsWith(entry);
        return (
          <Link
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
            to={isHome ? `/assetsBrowser/` : `/assetsBrowser${temp}/`}
            //onClick={() => callback(temp)}
            aria-current={isLast ? "page" : undefined}
          >
            {entry}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
abstract class AbstractBrowser extends React.Component<IProps, IState> {
  protected cdns: CdnSource = cdns;

  constructor(props: any) {
    super(props);

    this.state = {
      path: props.path,
      pathInformation: [],
      loading: true,
      error: null,
      pathModal: "",
      openModal: false,
      typeSelectedAsset: "api",
    };
  }

  abstract renderAssets(): any;
  abstract retreivePathInformation(path: string): void;

  nextPath(path: string) {
    path = path.replace(homePath, "").replace("//", "/");
    console.log("next path", path);
    this.props.history.push(path);
  }

  openFileModal(path: string, type: string) {
    this.setState({ path: path, openModal: true, typeSelectedAsset: type });
  }

  closeFileModal() {
    this.setState({ openModal: false });
  }

  render() {
    if (this.state.loading) {
      return <>common.loading</>;
    }

    if (this.state.error) {
      return <>common.error: {this.state.error}</>;
    }

    let path = renderBreadcrumb(
      this.state.path,
      this.retreivePathInformation.bind(this)
    );

    return (
      <>
        assetBrowser.path:
        {path}
        <br></br>
        {this.renderAssets()}
        <AssetModal
          openModal={this.state.openModal}
          path={this.state.path}
          type={this.state.typeSelectedAsset}
          callbackCloseModal={this.closeFileModal.bind(this)}
        />
      </>
    );
  }
}

export default AbstractBrowser;
