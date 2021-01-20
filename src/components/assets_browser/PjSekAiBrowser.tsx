//import React from "react";
import AbstractBrowser from "./AbstractBrowser";

class PjSekAiBrowser extends AbstractBrowser {
  constructor(props: any) {
    super(props);

    this.state = {
      path: props.path,
      pathInformation: [],
      loading: true,
      error: null,
      pathModal: "",
      openModal: false,
      typeSelectedAsset: "",
    };
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
    return "TODO";
  }
}

export default PjSekAiBrowser;
