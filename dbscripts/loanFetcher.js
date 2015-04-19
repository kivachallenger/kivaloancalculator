
var request = require('request');
var monk = require('monk');

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

getLoans(31800);

