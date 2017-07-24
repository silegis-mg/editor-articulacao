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
			options: webpackConfig,
			build: {
			},
			"build-dev": {
				devtool: "source-map",
			}
		},
		"webpack-dev-server": {
			options: {
				webpack: webpackConfig.desenv(),
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
				tasks: ["webpack:build-dev"],
				options: {
					spawn: false,
				}
			}
		}
	});

	// The development server (the recommended option for development)
	grunt.registerTask("default", ["webpack-dev-server:start"]);

	// Build and watch cycle (another option for development)
	// Advantage: No server required, can run app from filesystem
	// Disadvantage: Requests are not blocked until bundle is available,
	//               can serve an old app on too fast refresh
	grunt.registerTask("dev", ["webpack:build-dev", "watch:app"]);

	// Production build
	grunt.registerTask("build", ['karma:continuous', "webpack:build"]);

	grunt.registerTask('test', ['karma:continuous']);

	grunt.registerTask('debug', ['karma:debug']);
};