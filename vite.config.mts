import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import loadVersion from "vite-plugin-package-version";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";

const getPackageName = (id: string): string | undefined => {
  const normalizedId = id.replaceAll("\\", "/").split("?")[0];
  const nodeModulesIndex = normalizedId.lastIndexOf("/node_modules/");
  if (nodeModulesIndex < 0) return undefined;

  const segments = normalizedId
    .slice(nodeModulesIndex + "/node_modules/".length)
    .split("/");
  return segments[0]?.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0];
};

const packageChunkNames = new Map<string, string>([
  ["react", "vendor-react-runtime"],
  ["react-dom", "vendor-react-runtime"],
  ["react-is", "vendor-react-runtime"],
  ["scheduler", "vendor-react-runtime"],
  ["mobx", "vendor-mobx-runtime"],
  ["mobx-state-tree", "vendor-mobx-runtime"],
  ["@mui/material", "vendor-mui-material"],
  ["@mui/icons-material", "vendor-mui-icons"],
  ["@mui/lab", "vendor-mui-lab"],
  ["@mui/x-data-grid", "vendor-mui-data-grid"],
  ["@mui/x-date-pickers", "vendor-mui-date-pickers"],
  ["webp-hero", "vendor-webp-hero"],
  ["@huggingface/transformers", "vendor-huggingface-transformers"],
  ["onnxruntime-web", "vendor-onnxruntime"],
  ["onnxruntime-common", "vendor-onnxruntime"],
  ["openai", "vendor-openai-sdk"],
  ["@anthropic-ai/sdk", "vendor-anthropic-sdk"],
  ["@google/generative-ai", "vendor-google-generative-ai"],
  ["pixi.js", "vendor-pixi-entry"],
]);

const manualChunks = (id: string): string | undefined => {
  if (id === "\0commonjsHelpers.js") return "vendor-commonjs-helpers";

  const packageName = getPackageName(id);
  if (!packageName) return undefined;

  const packageChunkName = packageChunkNames.get(packageName);
  if (packageChunkName) return packageChunkName;
  if (!packageName.startsWith("@pixi/")) return undefined;

  const pixiPackage = packageName
    .slice("@pixi/".length)
    .replace(/[^a-zA-Z0-9-]/g, "-");
  return `vendor-pixi-${pixiPackage}`;
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
