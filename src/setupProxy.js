const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/file/sekai-assets",
    createProxyMiddleware({
      target: "https://sekai-res.dnaroma.eu/",
      changeOrigin: true,
    })
  );
};
