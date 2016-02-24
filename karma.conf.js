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
            'test/*.js',

            // fixtures
            {pattern: 'test/fixture/*.html', watched: true, served: true, included: false}
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
            'PhantomJS'
        ],

        singleRun: false
    });
};
