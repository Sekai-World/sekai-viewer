import React from "react";
import { withRouter } from "react-router-dom";
import AbstractBrowser from "./AbstractBrowser";
import AbstractPathInformation from "./AbstractBrowser";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
} from "@material-ui/core";
import { Folder } from "@material-ui/icons";

interface RayPathInformation extends AbstractPathInformation {
  path: string;
  type: string;
  filename: string;
}

class RayAssetsBrowser extends AbstractBrowser {
  constructor(props: any) {
    super(props);

    let path: string = props.history.location.pathname ?? "/assetsBrowser";
    path = path.replace("/assetsBrowser", "");
    if (path.startsWith("/")) {
      path = path.substr(1);
    }
    this.setState({ path: path });
  }

  componentDidMount() {
    this.retreivePathInformation();
  }

  retreivePathInformation(path: string = this.state.path) {
    let url = this.cdns.getRemoteAssetUrl(path).replaceAll("//", "/");
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        let isEmpty =
          json.response_data === undefined ? JSON.stringify(json) : null;
        this.setState({
          pathInformation: json.response_data,
          loading: false,
          path: path,
          error: isEmpty,
        });
      })
      .catch((e) => this.setState({ loading: false, error: e }));
  }

  renderAssets() {
    let pathInformation = this.state.pathInformation;

    let paths: string[] = [];
    let assets: RayPathInformation[] = [];

    pathInformation.map((e) => {
      let pathEntry = e as RayPathInformation;
      switch (pathEntry.type) {
        case "directory":
          return paths.push(pathEntry.filename);
        default:
          return assets.push(pathEntry);
      }
    });

    paths = paths.sort();

    return (
      <>
        <Grid container spacing={2}>
          {paths.map((path) => {
            return (
              <Grid item md={2} sm={3} xs={4}>
                <Card
                  onClick={() => {
                    this.nextPath("./" + path);
                  }}
                >
                  <CardActionArea>
                    <div
                      style={{
                        paddingTop: "20px",
                        height: "100%",
                        maxHeight: "300px",
                        alignContent: "center",
                        textAlign: "center",
                      }}
                    >
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
            );
          })}
          {assets.map((asset) => {
            let previewArea: any;
            switch (asset.type) {
              case "image":
                previewArea = (
                  <CardMedia
                    component="img"
                    alt={asset.path}
                    style={{
                      height: "100%",
                      maxHeight: "300px",
                    }}
                    image={this.cdns.getRemoteAssetUrl(asset.path)}
                  />
                );
                break;
            }
            return (
              <Grid item md={2} sm={3} xs={4}>
                <Card
                  onClick={() => {
                    this.nextPath("/assetsBrowser/" + asset.path);
                  }}
                >
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
            );
          })}
        </Grid>
      </>
    );
  }
}

export default withRouter(RayAssetsBrowser);
