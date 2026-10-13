const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

class AsyncStylesheetPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap("AsyncStylesheetPlugin", (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap("AsyncStylesheetPlugin", (data) => {
        data.assetTags.styles.forEach((tag) => {
          if (tag.attributes.href !== "main.css") return;

          tag.attributes.rel = "preload";
          tag.attributes.as = "style";
          tag.attributes.onload = "this.onload=null;this.rel='stylesheet'";
        });

        return data;
      });
    });
  }
}

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
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: "asset/resource",
        generator: { filename: "img/[name][ext]" },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
      scriptLoading: "defer",
    }),
    new AsyncStylesheetPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new CopyPlugin({
      patterns: [
        { from: "img", to: "img", globOptions: { ignore: ["**/asma-hammami.png"] } },
        { from: "document", to: "document" },
        { from: "src/critical.css", to: "critical.css" },
      ],
    }),
  ],
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()],
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
