export interface Cdn {
  name: string;
  url: string;
  secret?: any;
  l10n_name: string;
}

export interface JsonCdnStruct {
  cdns: Cdn[];
  dbCdns: Cdn[];
}

class CdnSource {

  private pointedCdn: string | null;
  private cdns: JsonCdnStruct;
  private selectedCdn: Cdn | null;

  private pointedDbCdn: string | null;
  private selectedDbCdn: Cdn | null;

  constructor() {

    this.pointedCdn = localStorage.getItem("pointedCdn");
    this.selectedCdn = null;
    this.pointedDbCdn = localStorage.getItem("pointedDbCdn");
    this.selectedDbCdn = null;

    try {
      try {
        this.cdns = require("../cdn_local.json");
      }
      catch (e) {
        this.cdns = require("../cdn.json");
      }

      this.cdns.cdns.forEach(cdn => {
        if (this.pointedCdn === cdn.name) {
          this.selectedCdn = cdn;
        }
      });

      if (this.selectedCdn === null) {
        this.setPointedCdn(this.cdns.cdns[0])
      }
    }
    catch(e) {
      console.warn("going with default setting")

      this.cdns = {
        cdns: [
          {
            name: "prod",
            url: `${process.env.REACT_APP_ASSET_DOMAIN}/file/sekai-assets/`,
            secret: null,
            l10n_name: "dummy"
          }
        ],
        dbCdns: [
          {
            name: "prod",
            url: '',
            secret: null,
            l10n_name: "dummy"
          }
        ]
      }

      this.selectedCdn = this.cdns.cdns[0];
    }

  }

  getRemoteAssetUrl(endpoint: string) {
    if (this.selectedCdn?.url.search("assets/") && endpoint.search("assets/"))
      endpoint = endpoint.replace("/assets/", "")
    return `${this.selectedCdn?.url}/${endpoint}`.replaceAll("//", "/") ;
  }

  getSelectedCdn() : Cdn | null{
    let out : Cdn | null = this.selectedCdn;

    if (out !== null && out?.secret) {
      out.secret = null;
    }

    return out;
  }

  private async secretChallenge(cdn: Cdn | null = this.selectedCdn, secretUsername: string | null = null, secretPassword: string | null = null) : Promise<boolean> {

    if (cdn === null) {
      throw new Error("cdn is null. this is a bug.");
    }

    return new Promise<boolean>((success) => {
      fetch(`${cdn.url}/secretChallenge`, {
        method: "POST",
        body: JSON.stringify({
          secret: cdn.secret,
          username: secretUsername,
          password: secretPassword
        })
      }).then(r => r.json()).then(json => {
          success(json.success);
      }).catch(e => {
        console.error(e);
        success(e);
      })
    })
  }

  async setPointedCdn(cdn: Cdn, secretUsername: string | null = null, secretPassword: string | null = null) {
    // If the CDN needs authorization in order to be used
    if (cdn.secret) {
      let result: boolean = await this.secretChallenge(cdn, secretUsername, secretPassword);

      // If it's not authorized, it's useless to bring over the CDN
      if (!result) {
        throw new Error("invalid access");
      }
    }

    this.selectedCdn = cdn;
    this.pointedCdn = cdn.name;
    localStorage.setItem("pointedCdn", cdn.name);
  }



}

export default CdnSource;
