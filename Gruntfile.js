module.exports = function (grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	var webpack = require("webpack");
	var webpackConfig = require("./webpack.config.js");

	grunt.initConfig({
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				background: true,
				singleRun: false
			},
			continuous: {
				configFile: 'karma.conf.js',
				background: false,
				singleRun: true/*,
				browsers: ['PhantomJS']*/
			},
			debug: {
				configFile: 'karma.conf.js',
				background: false,
				singleRun: false
			},
		},
		webpack: {
			buildPlain: webpackConfig('plain-js'),
			buildAngular1: webpackConfig('angular1'),
			"build-dev": webpackConfig('plain-js', true)
		},
		"webpack-dev-server": {
			options: {
				webpack: webpackConfig('plain-js', true),
				contentBase: 'build'
			},
			start: {
				webpack: {
					devtool: "inline-source-map",
				}
			}
		},
		watch: {
			app: {
				files: ["src/**/*"],
				tasks: ["webpack:build-dev", "jshint", "karma:continuous"],
				options: {
					spawn: false,
				}
			}
		},
		jshint: {
			all: ['*.js', 'src/**/*.js'],
			options: {
				browser: true,
				esversion: 6
			}
		}
	});

	// The development server (the recommended option for development)
	grunt.registerTask("default", ["webpack-dev-server:start"]);

	// Build and watch cycle (another option for development)
	// Advantage: No server required, can run app from filesystem
	// Disadvantage: Requests are not blocked until bundle is available,
	//               can serve an old app on too fast refresh
	grunt.registerTask("dev", ["jshint", "webpack:build-dev", "watch:app"]);

	// Production build
	grunt.registerTask("build", ['jshint', 'karma:continuous', "webpack:buildPlain", "webpack:buildAngular1"]);

	grunt.registerTask('test', ['jshint', 'karma:continuous']);

	grunt.registerTask('debug', ['karma:debug']);
};