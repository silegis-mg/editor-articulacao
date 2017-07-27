let webpackConfig = require("./webpack.config.js")('karma');

module.exports = function (config) {
    config.set({
        files: ['empacotamento/karma.js', 'test/karma/**/*.js'],
        frameworks: ['jasmine'],
        preprocessors: {
            'empacotamento/karma.js': ['webpack']
        },
        webpack: webpackConfig,
        // test results reporter to use 
        // possible values: 'dots', 'progress' 
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter 
        //        reporters: [/*'dots', 'coverage', */'kjhtml'],
        // web server port 
        port: 11111,
        colors: true,
        // level of logging 
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG 
        logLevel: config.LOG_DEBUG,
        autoWatch: true,
        browsers: ['ChromeNoSandbox', 'Firefox'],
        customLaunchers: { // https://github.com/karma-runner/karma-chrome-launcher/issues/73
            ChromeNoSandbox: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        singleRun: false,
        browserNoActivityTimeout: 300000,
        browserDisconnectTimeout: 300000,
        browserConsoleLogOptions: {
            level: "error",
            format: "%b %T: %m",
            terminal: true
        },
        browserDisconnectTolerance: 5,
        captureTimeout: 120000,
        concurrency: 1
    });
}; 