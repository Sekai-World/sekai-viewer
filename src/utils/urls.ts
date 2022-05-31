export const masterUrl = {
  cn: {
    jp: import.meta.env.VITE_JSON_DOMAIN_CN + "/master",
    tw: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-tw",
    cn: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-cn",
    en: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-en",
    kr: import.meta.env.VITE_JSON_DOMAIN_CN + "/master-kr",
  },
  ww: {
    jp: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-diff",
    tw: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-tc-diff",
    cn: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-cn-diff",
    en: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-en-diff",
    kr: import.meta.env.VITE_JSON_DOMAIN_MASTER + "/sekai-master-db-kr-diff",
  },
};

export const assetUrl = {
  cn: {
    jp: "https://sekai-assets-1258184166.file.myqcloud.com",
    tw: "https://sekai-tc-assets-1258184166.file.myqcloud.com",
    cn: "https://sekai-cn-assets-1258184166.file.myqcloud.com",
    en: "https://sekai-en-assets-1258184166.file.myqcloud.com",
    comic: "https://sekai-comics-1258184166.file.myqcloud.com",
    musicChart: "https://sekai-music-charts-1258184166.file.myqcloud.com",
    kr: "https://sekai-kr-assets-1258184166.cos.ap-shanghai.myqcloud.com",
  },
  minio: {
    jp: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-assets",
    tw: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-tc-assets",
    cn: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-cn-assets",
    en: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-en-assets",
    comic: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-comics",
    musicChart: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-music-charts",
    kr: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-kr-assets",
  },
};
