// See http://docs.busterjs.org/en/latest/modules/buster-configuration/
var config = module.exports;

config['Dev tests'] = {
	environment: 'browser'
	, rootPath: '../'
	, deps: ['lib/sha1.js']
	, src: ['src/OauthAccess.js']
	, specs: ['test/spec/OauthAccess.js']
	, extensions: [
		require('buster-istanbul')
	]
	, 'buster-istanbul': {
		outputDirectory: 'test/coverage',
		format: 'lcov'
	}
};