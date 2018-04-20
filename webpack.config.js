const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = (env, argv) => {
  function resolvePath(toResolve) {
    return path.resolve(__dirname, toResolve);
  }

  const isProduction = argv.mode === 'production';
  const buildPath = resolvePath('dist/');
  const exclude = /(node_modules|dist)/;

  const htmlSinglePage = new HtmlWebpackPlugin({
    entry: './index.html',
    template: resolvePath('src/index.html'),
    lang: 'en',
    title: 'Title',
    meta: [
      {
        name: 'description',
        content: 'Set your description here',
      },
    ],
    mobile: true,
    minify: {
      removeComments: isProduction,
      collapseWhitespace: isProduction,
    },
    favicon: resolvePath('src/assets/favicon.ico'),
  });

  const copiedFiles = new CopyWebpackPlugin([
    {
      from: {
        glob: resolvePath('src/assets/images'),
        dot: true,
      },
      to: buildPath,
    },
    {
      from: resolvePath('src/assets/robots.txt'),
      to: buildPath,
    },
  ]);

  const plugins = isProduction ? [] : [new webpack.HotModuleReplacementPlugin()];

  return {
    devtool: isProduction ? 'hidden-source-map' : 'cheap-module-eval-source-map',
    resolve: { extensions: ['.js'] },
    context: resolvePath('src'),
    entry: './index.js',
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude,
          loader: 'eslint-loader',
          options: {
            fix: true,
            failOnError: isProduction,
          },
        },
        {
          exclude,
          test: /\.js$/,
          use: 'babel-loader',
        },
        {
          exclude,
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(gif|jpg|png|svg)$/,
          use: ['file-loader'],
        },
        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          use: ['file-loader'],
        },
      ],
    },
    output: {
      filename: `[name]${isProduction ? '.[chunkhash]' : ''}.js`,
      path: buildPath,
      publicPath: '/',
    },
    plugins: [
      ...plugins,
      new webpack.DefinePlugin({
        IS_PRODUCTION: JSON.stringify(isProduction),
      }),
      new CleanWebpackPlugin(buildPath, {}),
      new webpack.DefinePlugin({
        IS_PRODUCTION: JSON.stringify(isProduction),
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new MiniCssExtractPlugin({
        filename: 'style.[contenthash].css',
      }),
      htmlSinglePage,
      new Dotenv({
        path: './.env',
      }),
      copiedFiles,
    ],
    devServer: {
      contentBase: buildPath,
      host: '0.0.0.0',
      port: 4000,
      stats: 'minimal',
      historyApiFallback: true,
    },
  };
};

module.exports = config;
