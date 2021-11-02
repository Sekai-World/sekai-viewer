export const masterUrl = {
  cn: {
    jp: import.meta.env.VITE_JSON_DOMAIN_CN + "/master",
    tw: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-tw",
    cn: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-cn",
    en: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-en",
  },
  ww: {
    jp: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-diff",
    tw: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-tc-diff",
    cn: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-cn-diff",
    en: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-en-diff",
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
    jp: import.meta.env.VITE_ASSET_DOMAIN_WW + "/sekai-assets",
    tw: import.meta.env.VITE_ASSET_DOMAIN_WW + "/sekai-tc-assets",
    cn: import.meta.env.VITE_ASSET_DOMAIN_WW + "/sekai-cn-assets",
    en: import.meta.env.VITE_ASSET_DOMAIN_WW + "/sekai-en-assets",
  },
  minio: {
    jp: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-assets",
    tw: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-tc-assets",
    cn: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-cn-assets",
    en: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-en-assets",
  },
};
