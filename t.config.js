// Karma configuration
// Generated on Wed Jul 23 2014 13:51:31 GMT+0900 (대한민국 표준시)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'lib/jquery-1.9.1.min.js',
        'lib/jquery.cookie.js',
        'node_modules/jasmine-jquery/lib/jasmine-jquery.js',

        'js/autoConfig.js',
        'js/AutoComplete.js',
        'js/DataManager.js',
        'js/InputManager.js',
        'js/ResultManager.js',
        {
            pattern: 'spec/javascripts/fixtures/*.html',
            watched: true,
            included: false,
            served: true
        },

        'test/*.spec.js',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'js/*.js' : ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'html'],

    htmlReporter: {
          outputFile: 'coverage_report.html'
    },


    // web server port
    port: 9876,



    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['Chrome', 'IE', 'Firefox'],
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
