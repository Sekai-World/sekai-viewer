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
  cn: {
    cn: "https://sekai-cn-assets-1258184166.file.myqcloud.com",
    comic: "https://sekai-comics-1258184166.file.myqcloud.com",
    en: "https://sekai-en-assets-1258184166.file.myqcloud.com",
    jp: "https://sekai-assets-1258184166.file.myqcloud.com",
    kr: "https://sekai-kr-assets-1258184166.cos.ap-shanghai.myqcloud.com",
    musicChart: "https://sekai-music-charts-1258184166.file.myqcloud.com",
    tw: "https://sekai-tc-assets-1258184166.file.myqcloud.com",
  },
  minio: {
    cn: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-cn-assets",
    comic: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-comics",
    en: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-en-assets",
    jp: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-assets",
    kr: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-kr-assets",
    musicChart: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-music-charts",
    tw: import.meta.env.VITE_ASSET_DOMAIN_MINIO + "/sekai-tc-assets",
  },
};
