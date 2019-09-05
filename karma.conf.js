/**
 * Config file for testing
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

var webdriverConfig = {
  hostname: 'fe.nhnent.com',
  port: 4444,
  remoteHost: true
};

/**
 * Set config by environment
 * @param {object} defaultConfig - default config
 * @param {string} server - server type ('ne' or local)
 */
function setConfig(defaultConfig, server) {
  if (server === 'ne') {
    defaultConfig.customLaunchers = {
      IE8: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '8'
      },
      IE9: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '9'
      },
      IE10: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '10'
      },
      IE11: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '11',
        platformName: 'windows'
      },
      Edge: {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'MicrosoftEdge'
      },
      'Chrome-WebDriver': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'chrome'
      },
      'Firefox-WebDriver': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'firefox'
      },
      'Safari-WebDriver': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'safari'
      }
    };
    defaultConfig.browsers = [
      'IE8',
      'IE9',
      'IE10',
      'IE11',
      'Edge',
      'Chrome-WebDriver',
      'Firefox-WebDriver'
      // 'Safari-WebDriver' // active only when safari test is needed
    ];
    defaultConfig.reporters.push('coverage');
    defaultConfig.reporters.push('junit');
    defaultConfig.coverageReporter = {
      dir: 'report/coverage/',
      reporters: [
        {
          type: 'html',
          subdir: function(browser) {
            return 'report-html/' + browser;
          }
        },
        {
          type: 'cobertura',
          subdir: function(browser) {
            return 'report-cobertura/' + browser;
          },
          file: 'cobertura.txt'
        }
      ]
    };
    defaultConfig.junitReporter = {
      outputDir: 'report/junit',
      suite: ''
    };
  } else {
    defaultConfig.browsers = ['ChromeHeadless'];
  }
}

module.exports = function(config) {
  var defaultConfig = {
    basePath: './',
    frameworks: ['jquery-1.11.0', 'jasmine', 'es5-shim'],
    files: [
      // reason for not using karma-jasmine-jquery framework is that including older jasmine-karma file
      // included jasmine-karma version is 2.0.5 and this version don't support ie8
      {
        pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
        watched: false
      },
      {
        pattern: 'test/fixtures/*.html',
        included: false
      },
      'test/preparation.js',
      'test/*.spec.js'
    ],
    preprocessors: {
      'test/*.js': ['webpack', 'sourcemap']
    },
    reporters: ['dots'],
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(test|bower_components|node_modules)/,
            loader: 'istanbul-instrumenter-loader'
          },
          {
            test: /\.js$/,
            exclude: /(bower_components|node_modules)/,
            loader: 'eslint-loader'
          }
        ]
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true
  };

  /* eslint-disable */
  setConfig(defaultConfig, process.env.KARMA_SERVER);
  config.set(defaultConfig);
};
