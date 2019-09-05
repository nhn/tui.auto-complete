/* eslint-disable no-process-env */
/**
 * Configs file for bundling
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');

var isProduction = process.argv.indexOf('--mode=production') > -1;

var FILENAME = pkg.name + (isProduction ? '.min.js' : '.js');
var BANNER = [
  FILENAME,
  '@version ' + pkg.version,
  '@author ' + pkg.author,
  '@license ' + pkg.license
].join('\n');

module.exports = {
  mode: 'development',
  entry: './src/js/autoComplete.js',
  output: {
    library: ['tui', 'AutoComplete'],
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: FILENAME
  },
  externals: {
    'tui-code-snippet': {
      commonjs: 'tui-code-snippet',
      commonjs2: 'tui-code-snippet',
      amd: 'tui-code-snippet',
      root: ['tui', 'util']
    },
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: '$'
    },
    'js-cookie': {
      commonjs: 'js-cookie',
      commonjs2: 'js-cookie',
      amd: 'js-cookie',
      root: 'Cookies'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'eslint-loader',
        options: {
          failOnError: isProduction
        }
      }
    ]
  },
  plugins: [new webpack.BannerPlugin(BANNER)],
  devServer: {
    historyApiFallback: false,
    progress: true,
    host: '0.0.0.0',
    disableHostCheck: true
  }
};
