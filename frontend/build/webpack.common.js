const path = require("path");
const WebpackBar = require("webpackbar");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

const clientDirectory =
  (...paths) => path.join(__dirname, "..", "client", ...paths);

module.exports = {
  "entry": {
    "about": clientDirectory("about", "about.js"),
    "analyze": clientDirectory("analyze", "analyze.ts"),
    "help": clientDirectory("help", "help.js"),
    "index": clientDirectory("index", "index.js"),
    "privacy": clientDirectory("privacy", "privacy.js"),
    "terms": clientDirectory("terms", "terms.js"),
  },
  "output": {
    "path": path.join(__dirname, "..", "dist"),
    "publicPath": "./",
  },
  "resolve": {
    "extensions": [".js", ".jsx", ".ts", ".tsx"],
  },
  "module": {
    "rules": [
      {
        "test": /\.jsx?$/,
        "use": "babel-loader",
      },
      {
        "test": /\.tsx?$/,
        "use": "ts-loader",
        "exclude": /node_modules/,
      },
      {
        "test": /\.html$/,
        "loader": "underscore-template-loader",
        "options": {
          "attributes": [], // Disable processing of images.
          "macros": {
            "googleAnalytics": generateGoogleAnalytics,
          },
        },
      },
      {
        "test": /\.s?css$/i,
        "use": [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            "loader": "css-loader",
            "options": {
              "url": false,
            },
          },
          {
            // Run postcss actions
            "loader": "postcss-loader",
            "options": {
              // `postcssOptions` is needed for postcss 8.x;
              // if you use postcss 7.x skip the key
              "postcssOptions": {
                // postcss plugins, can be exported to postcss.config.js
                "plugins": () => [require("autoprefixer")],
              }
            }
          }, {
            // compiles Sass to CSS
            "loader": "sass-loader",
          }]
      },
    ],
  },
  "plugins": [
    new HtmlWebpackPlugin({
      "filename": "about.html",
      "template": clientDirectory("about", "about.html"),
      "chunks": ["about"],
    }),
    new HtmlWebpackPlugin({
      "filename": "analyze.html",
      "template": clientDirectory("analyze", "analyze.html"),
      "chunks": ["analyze"],
    }),
    new HtmlWebpackPlugin({
      "filename": "help.html",
      "template": clientDirectory("help", "help.html"),
      "chunks": ["help"],
    }),
    new HtmlWebpackPlugin({
      "filename": "index.html",
      "template": clientDirectory("index", "index.html"),
      "chunks": ["index"],
    }),
    new HtmlWebpackPlugin({
      "filename": "privacy.html",
      "template": clientDirectory("privacy", "privacy.html"),
      "chunks": ["privacy"],
    }),
    new HtmlWebpackPlugin({
      "filename": "terms.html",
      "template": clientDirectory("terms", "terms.html"),
      "chunks": ["terms"],
    }),
    new WebpackBar(),
  ]
};

function generateGoogleAnalytics() {
  const ga = process.env.GOOGLE_ANALYTICS;
  if (devMode || ga === undefined || ga === "") {
    return "''";
  }
  return `'
<script async src=\\"https://www.googletagmanager.com/gtag/js?id=${ga}\\"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}
gtag(\\"js\\", new Date());
gtag(\\"config\\", \\"${ga}\\", {\\"anonymize_ip\\": true});
</script>
'`.replaceAll("\n", " "); // Result must be one liner else get compilation error.
}
