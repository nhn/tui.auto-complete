module.exports = function(config) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        basePath: './',

        frameworks: ['browserify', 'jasmine'],

        reporters: [
            'dots',
            'coverage',
            'junit'
        ],

        files: [
            // dependencies
            'bower_components/tui-code-snippet/code-snippet.js',
            'bower_components/jquery/jquery.min.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/js-cookie/jquery.cookie.js',
            //sources
            'src/js/**/*.js',
            'test/preparation.js',
            'test/*.test.js',
            'test/fixtures/**/*'
        ],

        exclude: [
        ],

        preprocessors: {
            'src/js/**/*.js': ['browserify', 'coverage'],
            'test/**/*.js': ['browserify']
        },

        browserify: {
            debug: true
        },

        coverageReporter: {
            dir : 'report/coverage/',
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
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
        ],

        customLaunchers: {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 8
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 9
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 10
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 11
            },
            'Edge': {
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
            }
        },

        singleRun: true
    });
};
