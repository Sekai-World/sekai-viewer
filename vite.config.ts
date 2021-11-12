import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";

import { dependencies } from "./package.json";
function renderChunks(deps: Record<string, string>) {
  let chunks = {};
  Object.keys(deps).forEach((key) => {
    if (["react", "react-router-dom", "react-dom"].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

export default defineConfig({
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-router-dom", "react-dom"],
          ...renderChunks(dependencies),
        },
      },
    },
  },
  plugins: [
    reactRefresh(),
    svgr(),
    loadVersion(),
    Icons({
      autoInstall: true,
      compiler: "jsx",
    }),
    VitePWA({
      includeAssets: ["favicon.ico", "robots.txt", "images/**/*.png"],
      manifest: {
        name: "Project Sekai Data Viewer",
        short_name: "Sekai Viewer",
        theme_color: "#298a7b",
        display: "standalone",
        orientation: "portrait",
        scope: "https://sekai.best/",
        start_url: "https://sekai.best/",
        icons: [
          {
            src: "images/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "images/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "images/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "images/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "images/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "images/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "images/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "images/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
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
        target: "http://localhost:1337",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/strapi/, ""),
      },
    },
  },
});
