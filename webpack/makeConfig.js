'use strict';
//const Visualizer = require('webpack-visualizer-plugin');
const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');

const DEFAULTS = {
  isDevelopment: process.env.NODE_ENV !== 'production',
  baseDir: path.join(__dirname, '..'),
};

function makePlugins(options) {
  const isDevelopment = options.isDevelopment;

  let plugins = [
    /*new Visualizer({
      filename: './statistics.html'
    }),*/
  ];

  if (!isDevelopment) {
    plugins = plugins.concat([
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        output: {
          comments: false,
        },
        minimize: true,
        compress: {
          warnings: false,
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
    ]);
  }

  return plugins;
}

function makeStyleLoaders(options) {
  if (options.isDevelopment) {
    return [
      {
        test: /\.s[ac]ss$/,
        loaders: [
          'style',
          'css?sourceMap',
          'autoprefixer-loader?browsers=last 2 version',
          'sass?sourceMap&sourceMapContents',
        ],
      },
    ];
  }

  return [
    {
      test: /\.s[ac]ss$/,
      loader: webpack.ExtractTextPlugin.extract(
        'style-loader',
        'css!autoprefixer-loader?browsers=last 2 version!sass'
      ),
    },
  ];
}

function makeConfig(options) {
  if (!options) options = {};
  _.defaults(options, DEFAULTS);

  const isDevelopment = options.isDevelopment;

  return {
    devtool: isDevelopment ? 'cheap-eval-source-map' : 'source-map',
    entry: {
      muse: path.join(options.baseDir, 'src/browser.js')
    },
    output: {
      path: path.join(options.baseDir, 'dist'),
      filename: '[name].min.js',
    },
    node: {
      fs: "empty"
    },
    plugins: makePlugins(options),
    module: {
      loaders: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.json?$/,
          loader: 'json-loader',
        },
      ],
    },
    resolve: {
      alias: {
        ws: path.join(options.baseDir, 'src/shim/ws.js')
      }
    }
  };
}

if (!module.parent) {
  console.log(makeConfig({
    isDevelopment: process.env.NODE_ENV !== 'production',
  }));
}

exports = module.exports = makeConfig;
exports.DEFAULTS = DEFAULTS;
