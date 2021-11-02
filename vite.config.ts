import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [
    reactRefresh(),
    svgr(),
    loadVersion(),
    Icons({
      autoInstall: true,
      compiler: "jsx",
    }),
  ],
  server: {
    proxy: {
      "/sekai-assets": {
        target: "https://sekai-res.dnaroma.eu/file",
        // target: "https://minio.dnaroma.eu",
        changeOrigin: true,
      },
      "/sekai-tc-assets": {
        target: "https://sekai-res.dnaroma.eu/file",
        // target: "https://minio.dnaroma.eu",
        changeOrigin: true,
      },
      "/minio/": {
        target: "https://minio.dnaroma.eu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ""),
      },
      "/api": {
        target: "https://api.sekai.best",
        // target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/strapi": {
        // target: "https://strapi-staging.sekai.best",
        target: "http://localhost:1447",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/strapi/, ""),
      },
    },
  },
});
