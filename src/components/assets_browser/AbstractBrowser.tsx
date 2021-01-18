import React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import CdnSource from "../../utils/cdnSource";

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
  pathInformation: AbstractPathInformation[];
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
abstract class AbstractBrowser extends React.Component<IProps, IState> {
  protected cdns: CdnSource = cdns;

  constructor(props: any) {
    super(props);

    this.state = {
      path: props.path,
      pathInformation: [],
      loading: true,
      error: null,
    };
  }

  abstract renderAssets(): any;
  abstract retreivePathInformation(path: string): void;

  selectAsset(assetPath: string) {
    //
  }

  nextPath(path: string) {
    this.props.history.push(path);
  }

  render() {
    if (this.state.loading) {
      return <>Loading</>;
    }

    if (this.state.error) {
      return <>Error: {this.state.error}</>;
    }

    let path = renderBreadcrumb(
      this.state.path,
      this.retreivePathInformation.bind(this)
    );

    return (
      <>
        Path:
        {path}
        <br></br>
        {this.renderAssets()}
      </>
    );
  }
}

export default AbstractBrowser;
