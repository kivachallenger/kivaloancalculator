
module.exports = function(grunt) {
	'use strict';


	// Project configuration.
	grunt.initConfig({
		meta: {
			version: require('./package.json').version
			, banner: '/**\n * OauthAccess.js - v<%= meta.version %> \n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> Kiva Microfunds\n' +
				' * \n' +
				' * Licensed under the MIT license.\n' +
				' * https://github.com/kiva/OauthAccess/blob/master/license.txt\n' +
				' */\n'

		}


		, buster: {
			test: {
				reporter: 'specification'
			}
		}


		, coveralls: {
			basic: {
				src: 'test/coverage/lcov.info'
				, force: true
			}
		}


		, jshint: {
			options: {
				jshintrc: '.jshintrc'
			}
			, all: ['src/*.js', 'test/spec/**/*.js']
		}


		, 'release-it': {
			options: {
				pkgFiles: ['package.json', 'bower.json'],
				commitMessage: 'Release %s',
				tagName: 'v%s',
				tagAnnotation: 'Version %s',
				buildCommand: 'grunt build'
			}
		}


		, rig: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				}
				, files: {
					'dist/amd/OauthAccess.js': ['build/_amd.js']
					, 'dist/OauthAccess.js': ['build/_iife.js']
				}
			}
		}


		, shell: {
			'rm-dist': {
				options: {
					stderr: false
				},
				command: 'rm -rf dist/*'
			}
		}


		, uglify: {
			target: {
				options: {
					banner: '<%= meta.banner %>'
				}
				, files: {
					'dist/OauthAccess.min.js': ['dist/OauthAccess.js']
					, 'dist/amd/OauthAccess.min.js': ['dist/amd/OauthAccess.js']
				}
			}
		}
	});


	grunt.loadNpmTasks('grunt-buster');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-coveralls');
	grunt.loadNpmTasks('grunt-release-it');
	grunt.loadNpmTasks('grunt-rigger');

	grunt.registerTask('test', ['jshint', 'buster']);
	grunt.registerTask('build', ['rig', 'uglify']);
};