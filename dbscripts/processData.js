
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

	teams.drop();

	// If team exists in database, quit
	// TODO

	teams.insert({'_id': teamid, loans: []}, function(err, doc) {
		// Find out how many loans the team has made
		getLoansForTeam(teamid, 1, function(err, response, data) {
			console.log("RESPONSE");
			console.log(response);
			if(response.statusCode != 200) {
				console.log("ERROR: CODE " + response.statusCode);
				return;
			}
			var obj = JSON.parse(data);
			
			var numpages = obj.paging.pages;
			var pagesComplete = 0;

			// Iterate through each page of loans by the team
			for(var page = 1; page <= 2; page++) {
				getLoansForTeam(teamid, page, function(err, response, data) {
					var obj = JSON.parse(data);
					// Insert the loans array into mongodb
					console.log(page + "/" + numpages + ": adding " + obj.loans.length + " loans");
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
								console.log(time/1000 + "s passed");
							}
						});
				});
			}
		});
	});
}

function getLoansForTeam(teamid, pagenumber, callback) {
	request.get('http://api.kivaws.org/v1/teams/' + teamid + '/loans.json?pagenumber=' + pagenumber, callback);
}

getLoans(28899);


