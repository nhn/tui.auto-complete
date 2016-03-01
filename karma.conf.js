'use strict';

var Mock = require('./test/mock'),
    config = require('./test/autoConfig');

var CONTEXT = {
    'Default': config.Default,
    'Plane': config.Plane,
    'mock': Mock.mock,
    'n_mock': Mock.n_mock
};

module.exports = function(config) {
    config.set({
        basePath: './',

        frameworks: ['browserify', 'jasmine'],

        reporters: [
            'dots',
            'coverage',
            'junit'
        ],

        // list of files / patterns to load in the browser
        files: [
            // dependencies
            'bower_components/tui-code-snippet/code-snippet.js',
            'bower_components/jquery/jquery.min.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/js-cookie/jquery.cookie.js',
            //sources
            'src/js/**/*.js',
            //'test/autocomplete.test.js',
            //'test/datamanager.test.js',
            //'test/inputmanager.test.js',
            //'test/resultmanager.test.js',
            'test/preparation.js',
            'test/*.test.js',
            'test/fixtures/**/*'
        ],

        exclude: [
        ],

        preprocessors: {
            'test/**/*.js': ['browserify'],
            'src/js/**/*.js': ['browserify', 'coverage']
        },

        browserify: {
            debug: true
        },

        coverageReporter: {
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
        },

        junitReporter: {
            outputDir: 'report',
            outputFile: 'report/junit-result.xml',
            suite: ''
        },

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: [
            'PhantomJS'
        ],

        singleRun: false
    });
};
