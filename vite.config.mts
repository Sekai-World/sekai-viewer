import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";

const getPackageName = (id: string): string | undefined => {
  const normalizedId = id.replace(/\\/g, "/").split("?")[0];
  const nodeModulesIndex = normalizedId.lastIndexOf("/node_modules/");
  if (nodeModulesIndex < 0) return undefined;

  const segments = normalizedId
    .slice(nodeModulesIndex + "/node_modules/".length)
    .split("/");
  return segments[0]?.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0];
};

const manualChunks = (id: string): string | undefined => {
  if (id === "\0commonjsHelpers.js") return "vendor-commonjs-helpers";

  const packageName = getPackageName(id);
  if (!packageName) return undefined;

  if (["react", "react-dom", "react-is", "scheduler"].includes(packageName)) {
    return "vendor-react-runtime";
  }
  if (packageName === "mobx" || packageName === "mobx-state-tree") {
    return "vendor-mobx-runtime";
  }
  if (packageName === "@mui/material") return "vendor-mui-material";
  if (packageName === "@mui/icons-material") return "vendor-mui-icons";
  if (packageName === "@mui/lab") return "vendor-mui-lab";
  if (packageName === "@mui/x-data-grid") return "vendor-mui-data-grid";
  if (packageName === "@mui/x-date-pickers") return "vendor-mui-date-pickers";
  if (packageName === "webp-hero") return "vendor-webp-hero";
  if (packageName === "@huggingface/transformers") {
    return "vendor-huggingface-transformers";
  }
  if (
    packageName === "onnxruntime-web" ||
    packageName === "onnxruntime-common"
  ) {
    return "vendor-onnxruntime";
  }
  if (packageName === "openai") return "vendor-openai-sdk";
  if (packageName === "@anthropic-ai/sdk") return "vendor-anthropic-sdk";
  if (packageName === "@google/generative-ai") {
    return "vendor-google-generative-ai";
  }
  if (packageName.startsWith("@pixi/")) {
    const pixiPackage = packageName
      .slice("@pixi/".length)
      .replace(/[^a-zA-Z0-9-]/g, "-");
    return `vendor-pixi-${pixiPackage}`;
  }
  if (packageName === "pixi.js") return "vendor-pixi-entry";

  return undefined;
};

export default defineConfig({
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks,
        onlyExplicitManualChunks: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [nodeModulesPolyfillPlugin()],
    },
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
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
      injectManifest: {
        globIgnores: ["**/ort-wasm-*.wasm"],
      },
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
