
var request = require('request');
var monk = require('monk');

var app_id = 'com.kivaimpactcalculator.app';

// Takes a team id and calls a callback with a list of loans
// Caches loans in database
// Limits calls to 500/minute to comply with rate limiting of KIVA ugh..
function getLoans(teamid) {
	var start = new Date().getTime();

	var db = monk('localhost/kiva');
	var teams = db.get('teams');

	// If team exists in database, quit
	// TODO

	teams.insert({'_id': teamid, loans: []}, function(err, doc) {
		// Find out how many loans the team has made
		getLoansForTeam(teamid, 1, function(err, response, data) {
			console.log("RESPONSE");
			console.log(response.headers);
			if(response.statusCode != 200) {
				console.log("ERROR: CODE " + response.statusCode);
				return;
			}

			var obj = JSON.parse(data);
			
			var numpages = obj.paging.pages;
			var pagesComplete = 0;

			var page = 1;

			var timeout = setInterval(function() {
				if(page > numpages) {
					clearInterval(timeout);
				}
				getLoansForTeam(teamid, page, function(err, response, data) {
					console.log("RESPONSE");
					console.log(response.headers);
					if(response.statusCode != 200) {
						console.log("ERROR: CODE " + response.statusCode);
					} else {
						var obj = JSON.parse(data);
						teams.update(
							{'_id': teamid},
							{'$pushAll': {'loans': obj.loans}}, 
							function(err, doc) {
								pagesComplete++;
								if(pagesComplete == numpages) {
									// All of the teams loans are stored in the database
									db.close();
									var end = new Date().getTime();
									var time = end - start;
									//console.log(time/1000 + "s passed");
								}
							});
					}
				});
				page++;
			}, 1200);
		});
	});
}

function getLoansForTeam(teamid, pagenumber, callback) {
	request.get('http://api.kivaws.org/v1/teams/' + teamid + '/loans.json?pagenumber=' + pagenumber, callback);
}

getLoans(283);




// Attempt to authenticate kiva

// var qs = require('querystring'), 
// oauth = {
// 	consumer_key: 'com.kivaimpactcalculator.app',
// 	consumer_secret: 'nDprJlwzJsnbLzuxjmvxFpqoeGgKwzon'
// }, url = 'https://api.kivaws.org/oauth/request_token';

// request.post({url: url, oauth: oauth}, function(err, res, body) {
// 	// Ideally, you would take the body in the response 
//   // and construct a URL that a user clicks on (like a sign in button). 
//   // The verifier is only available in the response after a user has 
//   // verified with twitter that they are authorizing your app. 

//   // step 2 
//   var req_data = qs.parse(body)
//   var uri = 'https://www.kiva.org/oauth/authorize'
//   + '?' + qs.stringify({oauth_token: req_data.oauth_token})
//   // redirect the user to the authorize uri 

//   // step 3 
//   // after the user is redirected back to your server 
//   var auth_data = qs.parse(body)
//   , oauth =
//   { consumer_key: 'com.kivaimpactcalculator.app',
//   	 consumer_secret: 'nDprJlwzJsnbLzuxjmvxFpqoeGgKwzon',
//   	 token: auth_data.oauth_token,
//   	 token_secret: req_data.oauth_token_secret,
//   	 verifier: auth_data.oauth_verifier
//   }, url = 'https://api.kivaws.org/oauth/access_token';

//   request.post({url:url, oauth:oauth}, function (e, r, body) {
//     // ready to make signed requests on behalf of the user 
//     var perm_data = qs.parse(body),
//     oauth = { 
//     	consumer_key: 'com.kivaimpactcalculator.app',
//     	consumer_secret:  'nDprJlwzJsnbLzuxjmvxFpqoeGgKwzon',
//     	token: perm_data.oauth_token,
//     	token_secret: perm_data.oauth_token_secret
//     }, url = 'http://api.kivaws.org/v1/teams/28899/loans.json?pagenumber=1', 
//     qs = { 
//     	screen_name: perm_data.screen_name,
//     	user_id: perm_data.user_id
//     };

//     request.get({url:url, oauth:oauth, json:true}, function (err, res, user) {
//     	console.log(err);
//     	console.log(res);
//     	console.log(user);
//     })
// })
// })

// Create an OauthAccess instance
// var oauth = new OauthAccess({
//     callback: ''
//     , key: ''
//     , accessTokens: {
//         token: ''
//         , tokenSecret: ''
//         , scope: ''
//     }
// });

// // Attach an "Authorization" header to your request
// $.ajax({
//     url: 'http://api.kivaws.org/v1/teams/28899/loans.json?pagenumber=1'
//     , beforeSend: function(jqXhr, options) {
//         jqXhr.setRequestHeader('Authorization', oauth.generateHeader(options.type, options.url););
//     }
// });


// describe('OAuth1.0',function(){
//   var OAuth = require('oauth');

//   it('tests trends Twitter API v1.1',function(done){
//     var oauth = new OAuth.OAuth(
//       'https://api.kivaws.org/oauth/request_token',
//       'https://api.kivaws.org/oauth/access_token',
//       'com.kivaimpactcalculator.app',
//       'nDprJlwzJsnbLzuxjmvxFpqoeGgKwzon',
//       '1.0A',
//       null,
//       'HMAC-SHA1'
//     );
//     oauth.get(
//       'https://api.twitter.com/1.1/trends/place.json?id=23424977',
//       'your user token for this app', //test user token
//       'your user secret for this app', //test user secret            
//       function (e, data, res){
//         if (e) console.error(e);        
//         console.log(require('util').inspect(data));
//         done();      
//       });    
//   });
// });



// getLoansForTeam(28899, 1, function(err, response, data) {
// 	console.log("RESPONSE " + response.statusCode);
// 	console.log(response.headers);
// });
