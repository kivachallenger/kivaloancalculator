buster.spec.expose();


describe('OauthAccess', function() {
	'use strict';

	var expect = buster.expect;


	it('takes a settings object, sets them as properties on the instance', function () {
		var oauth = new OauthAccess({
			callback: 'some_callback'
			, key: 'some_key'
			, signatureMethod: 'some_method'
			, accessTokens: {
				token: 'some_tokent'
				, tokenSecret: 'some_secret'
				, scope: 'some_scope'
			}
		});

		expect(oauth).toMatch({
			callback: 'some_callback'
			, key: 'some_key'
			, signatureMethod: 'some_method'
			, accessTokens: {
				token: 'some_tokent'
				, tokenSecret: 'some_secret'
				, scope: 'some_scope'
			}
		});
	});


	describe('.generateHeader()', function () {
		it('takes arguments, generates a oauth http "Authorization" header', function () {
			var authorizationHeader = OauthAccess.generateHeader('POST', 'http://kiva.org', null, '123', 'xyz', 'HMAC-BLAH', 'random-key', 'http://kiva.org/callback');

			this.stub(OauthAccess, 'generateNonce').returns(8366491.952911019);
			this.stub(OauthAccess, 'generateTimestamp').returns(1424900840);
			this.stub(OauthAccess, 'generateSignature').returns('EFMWtD4aOvhhxFvdXvBbFDDBI/k=');

			expect(authorizationHeader).toBeString();
		});
	});


	describe('p.generateHeader()', function () {
		it('calls .generateHeader', function () {
			var oauth = new OauthAccess({
				callback: 'some_callback'
				, key: 'some_key'
				, signatureMethod: 'some_method'
				, accessTokens: {
					token: 'some_tokent'
					, tokenSecret: 'some_secret'
					, scope: 'some_scope'
				}
			});

			this.stub(OauthAccess, 'generateHeader', function (arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
				expect(arg1).toBe('POST');
				expect(arg2).toBe('https://kiva.org/loans');
				expect(arg3).toEqual({});
				expect(arg4).toBe('some_tokent');
				expect(arg5).toBe('some_secret');
				expect(arg6).toBe('some_method');
				expect(arg7).toBe('some_key');
				expect(arg8).toBe('some_callback');
			});

			oauth.generateHeader('POST', 'https://kiva.org/loans', {});
			expect(OauthAccess.generateHeader).toHaveBeenCalled();
		});
	});
});