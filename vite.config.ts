import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  build: {
    outDir: "build",
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       vendor: ["react", "react-router-dom", "react-dom"],
    //       ...renderChunks(dependencies),
    //     },
    //   },
    // },
  },
  plugins: [
    react(),
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
        orientation: "any",
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
  optimizeDeps: {
    esbuildOptions: {
      plugins: [NodeModulesPolyfillPlugin()],
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: {
      "/sekai-assets": {
        target: "https://storage.sekai.best",
        // target: "https://minio.dnaroma.eu",
        changeOrigin: true,
      },
      "/sekai-tc-assets": {
        target: "https://storage.sekai.best",
        // target: "https://minio.dnaroma.eu",
        changeOrigin: true,
      },
      "/sekai-en-assets": {
        target: "https://storage.sekai.best",
        // target: "https://minio.dnaroma.eu",
        changeOrigin: true,
      },
      "/minio/": {
        target: "https://storage.sekai.best",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ""),
      },
      "/api": {
        target: "https://api.sekai.best",
        // target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // "/strapi": {
      //   target: "http://localhost:1337",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/strapi/, ""),
      // },
    },
  },
});
