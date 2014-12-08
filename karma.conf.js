// Karma configuration
// Generated on Wed Jul 23 2014 15:52:42 GMT+0900 (대한민국 표준시)

module.exports = function(config) {
  var webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
  };

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        //'src/lib/jquery-1.9.1.min.js',
        //'src/lib/jquery.cookie.js',
        //'src/common/common.js',

        // dependencies
        {pattern: 'src/libs/*.js', watched: false, served: true, included: true},
        {pattern: 'src/common/*.js', watched: false, served: true, included: true},
        {pattern: 'src/js/*.js', watched: false, served: true, included: true},
        {pattern: 'test/*.js', watched: false, served: true, included: true},
        {pattern: 'node_modules/jasmine-jquery/lib/jasmine-jquery.js', watched: false, served: true, included: true},

        // fixtures
        {pattern: 'test/fixture/*.html', watched: true, served: true, included: false}
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/js/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'junit'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage', 'junit'],

    junitReporter: {
        outputFile: 'report/junit-result.xml',
        suite: ''
    },

    coverageReporter: {
        type: 'html',
        dir: 'report/coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers: [
          //'IE7',
          //'IE8',
          //'IE9',
          //'IE10',
          'IE11',
          'Chrome-WebDriver'
          //'Firefox-WebDriver'
      ],

      customLaunchers: {
          'IE7': {
              base: 'WebDriver',
              config: webdriverConfig,
              browserName: 'IE7'
          },
          'IE8': {
              base: 'WebDriver',
              config: webdriverConfig,
              browserName: 'IE8'
          },
          'IE9': {
              base: 'WebDriver',
              config: webdriverConfig,
              browserName: 'IE9'
          },
          'IE10': {
              base: 'WebDriver',
              config: webdriverConfig,
              browserName: 'IE10'
          },
          'IE11': {
              base: 'WebDriver',
              config: webdriverConfig,
              browserName: 'IE11'
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
          }
      },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
