import React from 'react';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from "react-router";
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
//import Link from '@material-ui/core/Link';

import CdnSource from '../../utils/cdnSource';
import { withRouter } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Grid } from '@material-ui/core';
import { Folder } from '@material-ui/icons';

const cdns = new CdnSource();

type PathParamsType = {
  param1: any,
}

type IProps = RouteComponentProps<PathParamsType>;

interface PathInformation {
  path: string,
  type: string,
  filename: string
}

interface IState {
  path: string,
  pathInformation: PathInformation[],
  loading: boolean,
  error: string | null,
}

function renderBreadcrumb(assetPath: string, callback: any) {

  let splittedPath: string[] = assetPath.split("/")
  let temp: string = "";
  if (splittedPath[splittedPath.length - 1] === "") {
    let tempElement: string | undefined = splittedPath.pop()
    assetPath = assetPath.replace(tempElement + "/", "");
  }
  let out: any = splittedPath.map(entry => {
    temp = temp + "/" + entry;
    let isLast = assetPath.endsWith(entry)
    return <Link
      style={{
        textDecoration: "none",
        color: isLast ? "textPrimary" : "inherit"
      }}
      to={"/assetsBrowser" + temp + "/"}
      //onClick={() => callback(temp)}
      aria-current={isLast ? "page" : undefined}
    >
      {entry}
    </Link>
  }
  )
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {out}
    </Breadcrumbs>
  );
}

class AssetsBrowser extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    let path: string = props.history.location.pathname ?? "/assetsBrowser";
    path = path.replace("/assetsBrowser", "");
    if (path.startsWith("/"))
      path = path.substr(1);

    this.state = {
      path: path,
      pathInformation: [],
      //
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.retreivePathInformation()
  }

  componentDidUpdate() {
    let newPath: string = this.props.history.location.pathname ?? "/assetsBrowser";
    newPath = newPath.replace("/assetsBrowser", "").replaceAll("//", "/");
    if (newPath.startsWith("/"))
      newPath = newPath.substr(1);
    if (this.state.path !== newPath) {
      this.retreivePathInformation(newPath);
      return true;
    }
    return false;
  }

  retreivePathInformation(path: string = this.state.path) {
    let url = cdns.getRemoteAssetUrl(path).replaceAll("//", "/")
    fetch(url).then(r => r.json()).then(json => {
      let isEmpty = json.response_data === undefined ? JSON.stringify(json) : null;
      this.setState({ pathInformation: json.response_data, loading: false, path: path, error: isEmpty });
    }).catch(e => this.setState({ loading: false, error: e }))
  }

  selectAsset(assetPath: string) {
    //
  }

  nextPath(path: string) {
    this.props.history.push(path);
  }

  render() {

    console.log(this.state);

    let pathInformation = this.state.pathInformation;

    if (this.state.loading) {
      return <>Loading</>
    }

    if (this.state.error) {
      return <>Error: {this.state.error}</>
    }

    let paths: string[] = [];
    let assets: PathInformation[] = [];

    pathInformation.map(pathEntry => {
      switch (pathEntry.type) {
        case "directory":
          return paths.push(pathEntry.filename);
        default:
          return assets.push(pathEntry);
      }
    })

    paths = paths.sort()

    return <>
      Path: {renderBreadcrumb(this.state.path, this.retreivePathInformation.bind(this))}
      <br></br>

      <Grid container spacing={2}>
        {
          paths.map(path => {
            return <Grid item md={2} sm={3} xs={4}>
              <Card onClick={() => {this.nextPath("./" + path)}}>
                <CardActionArea>
                  <div style={
                    {
                      paddingTop: "20px",
                      height: "100%",
                      maxHeight: "300px",
                      alignContent: "center",
                      textAlign: "center"
                    }
                  }>
                    <Folder />
                  </div>
                  <CardContent>
                    <div style={{ width: "100%" }}>
                      <b>{path}</b>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          })
        }
        {
          assets.map(asset => {
            let previewArea: any;
            switch (asset.type) {
              case "image":
                previewArea = <CardMedia
                  component="img"
                  alt={asset.path}
                  style={
                    {
                      height: "100%",
                      maxHeight: "300px"
                    }
                  }
                  image={cdns.getRemoteAssetUrl(asset.path)}
                />;
                break;
            }
            return <Grid item md={2} sm={3} xs={4}>
              <Card onClick={() => {this.nextPath("/assetsBrowser/" + asset.path)}}>
                <CardActionArea>
                  {previewArea}
                  <CardContent>
                    <div style={{ width: "100%" }}>
                      <b>{asset.filename}</b>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          })
        }
      </Grid>
    </>
  }
}

export default withRouter(AssetsBrowser);
