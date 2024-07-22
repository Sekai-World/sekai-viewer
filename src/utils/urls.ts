export const masterUrl = {
  cn: {
    cn: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-cn",
    en: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-en",
    jp: import.meta.env.VITE_JSON_DOMAIN_CN + "/master",
    kr: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-kr",
    tw: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-tw",
  },
  ww: {
    cn: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-cn-diff",
    en: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-en-diff",
    jp: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-diff",
    kr: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-kr-diff",
    tw: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-tc-diff",
  },
};

export const assetUrl = {
  minio: {
    cn: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-cn-assets",
    comic: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-comics",
    en: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-en-assets",
    jp: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-jp-assets",
    kr: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-kr-assets",
    musicChart: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-music-charts",
    tw: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-tc-assets",
  },
};
