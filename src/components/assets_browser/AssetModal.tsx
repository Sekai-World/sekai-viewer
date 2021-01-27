import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import CdnSource from "../../utils/cdnSource";
import { Button, Paper } from "@material-ui/core";
import ReactJson from "react-json-view";

interface IProps {
  openModal: boolean;
  path: string;
  type: string;
  classes: any;
  callbackCloseModal: any;
}

interface IState {
  path: string;
  open: boolean;
  loading: boolean;
  error: string | null;
  contents: any;
  callbackCloseModal: any;
}

const cdns = new CdnSource();

const classes: any = {
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: "white",
    border: "2px solid #000",
  },
};

class AssetModal extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      open: props.openModal,
      path: props.path,
      loading: true,
      error: null,
      contents: null,
      callbackCloseModal: props.callbackCloseModal,
    };
  }

  componentDidMount() {
    this.loadAsset();
  }

  componentDidUpdate() {
    let isUpdated = false;
    if (this.props.openModal !== this.state.open) {
      this.setState({ open: this.props.openModal });
      isUpdated = true;
    }
    if (this.props.path !== this.state.path) {
      this.loadAsset(this.props.path);
      isUpdated = true;
    }

    return isUpdated;
  }

  loadAsset(path: string = this.state.path) {
    if (this.state.path !== "") {
      let output: any = "";
      switch (this.props.type) {
        case "image":
          output = (
            <div
              style={{
                alignContent: "center",
                textAlign: "center",
              }}
            >
              <img
                width="100%"
                style={{
                  maxWidth: "400px",
                }}
                src={cdns.getRemoteAssetUrl(this.state.path)}
                alt=""
              />
            </div>
          );
          this.setState({ loading: false, contents: output, path: path });
          break;
        case "video":
          output = (
            <div
              style={{
                alignContent: "center",
                textAlign: "center",
              }}
            >
              <video width="100%" controls>
                <source
                  src={cdns.getRemoteAssetUrl(this.state.path)}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          );
          this.setState({ loading: false, contents: output, path: path });
          break;
        case "audio":
          output = (
            <div
              style={{
                alignContent: "center",
                textAlign: "center",
              }}
            >
              <audio controls>
                <source
                  src={cdns.getRemoteAssetUrl(this.state.path)}
                  type="audio/mp3"
                />
                Your browser does not support the audio tag.
              </audio>
            </div>
          );
          this.setState({ loading: false, contents: output, path: path });
          break;
        case "api":
          break;
        default:
          fetch(cdns.getRemoteAssetUrl(this.state.path))
            .then((r) => r.text())
            .then((data) => {
              let testJson;
              try {
                testJson = JSON.parse(data);
              } catch (e) {
                console.error(e);
                testJson = data;
              }
              if (typeof testJson !== "string") {
                if (testJson.response_data === undefined) {
                  this.setState({
                    loading: false,
                    contents: (
                      <ReactJson
                        src={testJson}
                        style={{ backgroundColor: "lightgray" }}
                      />
                    ),
                    path: path,
                  });
                } else {
                  this.setState({ loading: true, path: path });
                }
              } else {
                this.setState({
                  loading: false,
                  contents: <pre>{data}</pre>,
                  path: path,
                });
              }
            })
            .catch((err) =>
              this.setState({ loading: false, error: err, path: path })
            );
          break;
      }
    } else {
      this.setState({ loading: false, error: "empty", path: path });
    }
  }

  handleClose() {
    this.state.callbackCloseModal();
  }

  // TODO fix opening correct path
  download() {
    window.open(cdns.getRemoteAssetUrl(this.state.path), "_blank");
  }

  render() {
    let contents: any;

    let style: any = {
      padding: "20px",
    };

    if (true) {
      style.overflow = "scroll";
      style.height = "100%";
      style.maxHeight = "75vh";
    }

    if (this.state.loading) {
      contents = <>Loading...</>;
    } else if (this.state.error) {
      contents = <>{this.state.error}</>;
    } else {
      contents = (
        <div>
          <div style={style}>
            <h3>assetPreview</h3>
            <div
              style={{
                textAlign: this.props.type === "unknown" ? "left" : "justify",
              }}
            >
              {this.state.contents}
            </div>
          </div>
          <br />
          <Button onClick={this.handleClose.bind(this)}>Close</Button>
        </div>
      );
    }

    return (
      <div
        hidden={!this.state.open}
        style={{ height: "100%", width: "100%", maxWidth: "75vh" }}
      >
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          //className={classes.modal}
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
          style={{
            padding: "50px",
            alignContent: "center",
            textAlign: "center",
          }}
        >
          <Fade in={this.state.open}>
            <Paper>{contents}</Paper>
          </Fade>
        </Modal>
      </div>
    );
  }
}

export default withStyles(classes)(AssetModal);
