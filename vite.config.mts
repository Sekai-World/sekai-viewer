import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";

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
  optimizeDeps: {
    esbuildOptions: {
      plugins: [nodeModulesPolyfillPlugin()],
    },
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
      filename: "service-worker.ts",
      includeAssets: ["favicon.ico", "robots.txt", "images/**/*.png"],
      manifest: {
        display: "standalone",
        icons: [
          {
            sizes: "72x72",
            src: "images/icons/icon-72x72.png",
            type: "image/png",
          },
          {
            sizes: "96x96",
            src: "images/icons/icon-96x96.png",
            type: "image/png",
          },
          {
            sizes: "128x128",
            src: "images/icons/icon-128x128.png",
            type: "image/png",
          },
          {
            sizes: "144x144",
            src: "images/icons/icon-144x144.png",
            type: "image/png",
          },
          {
            sizes: "152x152",
            src: "images/icons/icon-152x152.png",
            type: "image/png",
          },
          {
            sizes: "192x192",
            src: "images/icons/icon-192x192.png",
            type: "image/png",
          },
          {
            sizes: "384x384",
            src: "images/icons/icon-384x384.png",
            type: "image/png",
          },
          {
            sizes: "512x512",
            src: "images/icons/icon-512x512.png",
            type: "image/png",
          },
        ],
        name: "Project Sekai Data Viewer",
        orientation: "any",
        scope: "https://sekai.best/",
        short_name: "Sekai Viewer",
        start_url: "https://sekai.best/",
        theme_color: "#298a7b",
      },
      srcDir: "src",
      strategies: "injectManifest",
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: {
      "/api": {
        // target: "http://localhost:9999",
        changeOrigin: true,

        rewrite: (path) => path.replace(/^\/api/, ""),
        target: "https://api.sekai.best",
      },
      "/minio/": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/minio/, ""),
        target: "https://storage.sekai.best",
      },
      "/sekai-jp-assets": {
        changeOrigin: true,
        target: "https://storage.sekai.best",
      },
      "/sekai-en-assets": {
        changeOrigin: true,
        target: "https://storage.sekai.best",
      },
      "/sekai-tc-assets": {
        changeOrigin: true,
        target: "https://storage.sekai.best",
      },
      "/sekai-best-assets": {
        changeOrigin: true,
        target: "https://storage.sekai.best",
      },
      "/strapi/sekai-current-event": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/strapi/, ""),
        target: "https://strapi.sekai.best",
      },
      "/strapi": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/strapi/, ""),
        target: "http://localhost:1337",
      },
      "/test-static": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/test-static/, ""),
        target: "http://localhost:8000",
      },
    },
  },
});
