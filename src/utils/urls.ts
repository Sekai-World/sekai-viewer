export const masterUrl = {
  cn: {
    jp: process.env.REACT_APP_JSON_DOMAIN_CN + "/master",
    tw: process.env.REACT_APP_JSON_DOMAIN_CN + "/master-tw",
    cn: process.env.REACT_APP_JSON_DOMAIN_CN + "/master-cn",
    en: process.env.REACT_APP_JSON_DOMAIN_CN + "/master-en",
  },
  ww: {
    jp: process.env.REACT_APP_JSON_DOMAIN_MASTER + "/sekai-master-db-diff",
    tw: process.env.REACT_APP_JSON_DOMAIN_MASTER + "/sekai-master-db-tc-diff",
    cn: process.env.REACT_APP_JSON_DOMAIN_MASTER + "/sekai-master-db-cn-diff",
    en: process.env.REACT_APP_JSON_DOMAIN_MASTER + "/sekai-master-db-en-diff",
  },
};

export const assetUrl = {
  cn: {
    jp: "https://sekai-assets-1258184166.file.myqcloud.com",
    tw: "https://sekai-tc-assets-1258184166.file.myqcloud.com",
    cn: "https://sekai-cn-assets-1258184166.file.myqcloud.com",
    en: "https://sekai-en-assets-1258184166.file.myqcloud.com",
  },
  ww: {
    jp: process.env.REACT_APP_ASSET_DOMAIN_WW + "/sekai-assets",
    tw: process.env.REACT_APP_ASSET_DOMAIN_WW + "/sekai-tc-assets",
    cn: process.env.REACT_APP_ASSET_DOMAIN_WW + "/sekai-cn-assets",
    en: process.env.REACT_APP_ASSET_DOMAIN_WW + "/sekai-en-assets",
  },
  minio: {
    jp: process.env.REACT_APP_ASSET_DOMAIN_MINIO + "/sekai-assets",
    tw: process.env.REACT_APP_ASSET_DOMAIN_MINIO + "/sekai-tc-assets",
    cn: process.env.REACT_APP_ASSET_DOMAIN_MINIO + "/sekai-cn-assets",
    en: process.env.REACT_APP_ASSET_DOMAIN_MINIO + "/sekai-en-assets",
  },
};
