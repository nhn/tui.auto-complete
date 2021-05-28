/**
 * Configs file for bundling
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var TerserPlugin = require('terser-webpack-plugin');

function getOptimization(isMinified) {
  if (isMinified) {
    return {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          extractComments: false
        })
      ]
    };
  }

  return {
    minimize: false
  };
}

module.exports = function(env, argv) {
  var isProduction = argv.mode === 'production';
  var isMinified = !!argv.minify;
  var FILENAME = pkg.name + (isMinified ? '.min' : '');
  var BANNER = [
    'TOAST UI Auto Complete',
    '@version ' + pkg.version,
    '@author ' + pkg.author,
    '@license ' + pkg.license
  ].join('\n');

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/js/autoComplete.js',
    output: {
      library: ['tui', 'AutoComplete'],
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'dist/',
      filename: FILENAME + '.js'
    },
    externals: {
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
          enforce: 'pre',
          options: {
            failOnError: isProduction
          }
        }
      ]
    },
    plugins: [new webpack.BannerPlugin(BANNER)],
    optimization: getOptimization(isMinified),
    devServer: {
      historyApiFallback: false,
      progress: true,
      host: '0.0.0.0',
      disableHostCheck: true
    }
  };
}
