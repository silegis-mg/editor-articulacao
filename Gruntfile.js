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

module.exports = function (grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	var webpackConfig = require("./webpack.config.js");
	
	grunt.initConfig({
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				background: false,
				singleRun: true
			},
			debug: {
				configFile: 'karma.conf.js',
				background: false,
				singleRun: false
			}
		},
		webpack: {
			buildPlain: webpackConfig('plain-js'),
			buildAngular1: webpackConfig('angular1'),
			buildPlainPolyfill: webpackConfig('plain-js', false, true),
			buildAngular1Polyfill: webpackConfig('angular1', false, true),
			"build-dev": webpackConfig('plain-js', true)
		},
		"webpack-dev-server": {
			options: webpackConfig('plain-js', true),
			start: {
			}
		},
		watch: {
			app: {
				files: ["src/**/*"],
				tasks: ["webpack:build-dev", "jshint", "karma:unit"],
				options: {
					spawn: false,
				}
			}
		},
		jshint: {
			all: ['*.js', 'src/**/*.js', 'empacotamento/**/*.js'],
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
	grunt.registerTask("build", ["webpack:buildPlain", "webpack:buildAngular1", "webpack:buildPlainPolyfill", "webpack:buildAngular1Polyfill"]);
	grunt.registerTask("build-plain", ["webpack:buildPlain"]);
	grunt.registerTask("build-plain-polyfill", ["webpack:buildPlainPolyfill"]);
	grunt.registerTask("build-angular1", ["webpack:buildAngular1"]);

	grunt.registerTask('test', ['jshint', 'karma:unit']);

	grunt.registerTask('debug', ['karma:debug']);
};
