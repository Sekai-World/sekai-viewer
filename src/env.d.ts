interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ASSET_DOMAIN_WW: string;
  readonly VITE_ASSET_DOMAIN_MINIO: string;
  readonly VITE_ASSET_DOMAIN_CN: string;
  readonly VITE_JSON_DOMAIN_WW: string;
  readonly VITE_JSON_DOMAIN_CN: string;
  readonly VITE_JSON_DOMAIN_MASTER: string;
  readonly VITE_API_BACKEND_BASE: string;
  readonly VITE_STRAPI_BASE: string;
  readonly VITE_FRONTEND_ASSET_BASE: string;
  readonly VITE_FRONTEND_ASSET_BASE_CN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
