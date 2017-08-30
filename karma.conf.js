/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

let webpackConfig = require("./webpack.config.js")('karma', true);

module.exports = function (config) {
    config.set({
        files: ['empacotamento/karma.js', 'test/karma/**/*.js'],
        frameworks: ['jasmine'],
        preprocessors: {
            'empacotamento/karma.js': ['webpack']
        },
        webpack: webpackConfig,
        port: 11111,
        colors: true,
        logLevel: config.LOG_WARN,
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
