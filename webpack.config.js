const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
    assetModuleFilename: "assets/[name][ext]",
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ["style-loader", "css-loader", "postcss-loader"] },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: "asset/resource",
        generator: { filename: "img/[name][ext]" },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html", filename: "index.html" }),
    new CopyPlugin({
      patterns: [{ from: "img", to: "img", globOptions: { ignore: ["**/asma-hammami.png"] } }],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          enforce: true,
        },
      },
    },
    runtimeChunk: "single",
  },
  devServer: {
    host: "0.0.0.0",
    static: { directory: path.join(__dirname, "dist") },
    port: 8080,
    open: true,
    hot: true,
  },
  performance: { hints: false, maxAssetSize: 700000, maxEntrypointSize: 700000 },
};
